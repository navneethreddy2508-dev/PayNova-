"""
Prediction service integrating the Stage 3 Return-Risk ML model with the database.
"""

import os
import sys
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.config import (
    DEFAULT_LOW_RISK_MAX,
    DEFAULT_MEDIUM_RISK_MAX,
    DEFAULT_HIGH_RISK_MIN
)
from backend.models.prediction import ReturnPrediction
from backend.models.order import Order
from backend.models.customer import Customer
from backend.models.product import Product
from backend.models.intervention import ReturnIntervention
from backend.models.settings import ReturnSettings
from backend.services.audit_service import log_audit_event

# Ensure ML package is reachable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.src.predict import ReturnRiskPredictor

_predictor_instance = None

def get_ml_predictor() -> ReturnRiskPredictor:
    """Singleton getter for the Stage 3 ML model predictor."""
    global _predictor_instance
    if _predictor_instance is None:
        model_file = os.path.join(PROJECT_ROOT, "ml", "models", "best_model.joblib")
        meta_file = os.path.join(PROJECT_ROOT, "ml", "models", "model_metadata.json")
        _predictor_instance = ReturnRiskPredictor(model_path=model_file, metadata_path=meta_file)
    return _predictor_instance

def get_current_thresholds(db: Session) -> Dict[str, float]:
    """Retrieves active risk thresholds from DB or defaults."""
    settings = db.query(ReturnSettings).filter(ReturnSettings.setting_id == "default").first()
    if settings:
        return {
            "low_max": float(settings.low_risk_threshold) / 100.0,
            "medium_max": float(settings.medium_risk_threshold) / 100.0,
            "high_min": float(settings.high_risk_threshold) / 100.0,
            "auto_flag": float(settings.auto_flag_threshold) / 100.0
        }
    return {
        "low_max": DEFAULT_LOW_RISK_MAX,
        "medium_max": DEFAULT_MEDIUM_RISK_MAX,
        "high_min": DEFAULT_HIGH_RISK_MIN,
        "auto_flag": 0.80
    }

def predict_return_risk_for_order(
    db: Session,
    order_input: Dict[str, Any],
    persist: bool = True
) -> Dict[str, Any]:
    """
    Executes the full return-risk prediction workflow:
    1. Hydrates customer and product features from DB if needed
    2. Runs Stage 3 ML preprocessing & Random Forest champion inference
    3. Calculates Return Probability, Risk Score, and Revenue at Risk in INR (₹)
    4. Computes explainability feature contributions
    5. Persists prediction to DB and creates intervention/audit if high risk
    """
    predictor = get_ml_predictor()
    order_id = str(order_input.get("order_id") or order_input.get("id") or f"ORD-{uuid.uuid4().hex[:6].upper()}")
    customer_id = order_input.get("customer_id")
    product_id = order_input.get("product_id")
    order_value = float(order_input.get("order_value", order_input.get("value", 0.0)))
    
    # 1. Hydrate customer features from DB if not provided
    cust_hist_rate = order_input.get("customer_historical_return_rate")
    cust_orders = order_input.get("customer_order_count")
    cust_prev_returns = order_input.get("customer_previous_return_count")
    cust_prev_cancels = order_input.get("customer_previous_cancel_count")
    cust_avg_aov = order_input.get("customer_avg_order_value")
    
    if customer_id:
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if customer:
            if cust_hist_rate is None:
                cust_hist_rate = customer.historical_return_rate
            if cust_orders is None:
                cust_orders = customer.total_orders
            if cust_prev_returns is None:
                cust_prev_returns = customer.previous_returns
            if cust_prev_cancels is None:
                cust_prev_cancels = customer.previous_cancellations
            if cust_avg_aov is None:
                cust_avg_aov = customer.average_order_value or order_value

    # Defaults if still None
    cust_hist_rate = float(cust_hist_rate if cust_hist_rate is not None else 0.15)
    cust_orders = int(cust_orders if cust_orders is not None else 1)
    cust_prev_returns = int(cust_prev_returns if cust_prev_returns is not None else 0)
    cust_prev_cancels = int(cust_prev_cancels if cust_prev_cancels is not None else 0)
    cust_avg_aov = float(cust_avg_aov if cust_avg_aov is not None else order_value)
    
    # 2. Hydrate product & category baseline features
    prod_hist_rate = order_input.get("product_historical_return_rate")
    cat_hist_rate = order_input.get("category_historical_return_rate")
    category = order_input.get("product_category", order_input.get("category", "Apparel"))
    
    if product_id:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if product:
            if prod_hist_rate is None:
                prod_hist_rate = product.historical_return_rate
            if cat_hist_rate is None:
                cat_hist_rate = product.category_return_rate
            if not category or category == "Apparel":
                category = product.category

    prod_hist_rate = float(prod_hist_rate if prod_hist_rate is not None else 0.20)
    cat_hist_rate = float(cat_hist_rate if cat_hist_rate is not None else 0.18)
    
    val_deviation = order_input.get("order_value_deviation")
    if val_deviation is None:
        val_deviation = (order_value - cust_avg_aov) / cust_avg_aov if cust_avg_aov > 0 else 0.0

    # 3. Construct ML Feature Dictionary for Stage 3 Predictor
    ml_features = {
        "order_id": order_id,
        "order_value": order_value,
        "product_category": category,
        "payment_method": order_input.get("payment_method", order_input.get("paymentMethod", "UPI")),
        "delivery_type": order_input.get("delivery_type", "Standard"),
        "delivery_delay_days": int(order_input.get("delivery_delay_days", 0)),
        "number_of_items": int(order_input.get("number_of_items", 1)),
        "is_multi_size_order": int(order_input.get("is_multi_size_order", 0)),
        "discount_percent": float(order_input.get("discount_percent", 0.0)),
        "is_first_time_customer": int(1 if cust_orders == 0 else 0),
        "customer_order_count": cust_orders,
        "customer_previous_return_count": cust_prev_returns,
        "customer_previous_cancel_count": cust_prev_cancels,
        "customer_historical_return_rate": cust_hist_rate,
        "customer_avg_order_value": cust_avg_aov,
        "order_value_deviation": float(val_deviation),
        "product_historical_return_rate": prod_hist_rate,
        "category_historical_return_rate": cat_hist_rate
    }

    # Run ML Prediction
    raw_res = predictor.predict(ml_features)
    prob = raw_res["return_probability"]
    score = raw_res["risk_score"]
    
    # 4. Assign Risk Level using live DB settings
    thresholds = get_current_thresholds(db)
    if prob >= thresholds["high_min"]:
        risk_level = "HIGH"
    elif prob > thresholds["low_max"]:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
        
    revenue_at_risk = round(order_value * prob, 2)
    top_factors = raw_res["top_risk_factors"]
    model_version = raw_res.get("model_version", "order-return-risk-model-v1.0")

    result_payload = {
        "order_id": order_id,
        "return_probability": prob,
        "risk_score": score,
        "risk_level": risk_level,
        "order_value_inr": order_value,
        "revenue_at_risk_inr": revenue_at_risk,
        "top_risk_factors": top_factors,
        "model_version": model_version,
        "created_at": datetime.now(timezone.utc)
    }

    # 5. Persist to Database if requested
    if persist:
        # Check if order exists in DB; if not, create placeholder or link
        db_order = db.query(Order).filter(Order.order_id == order_id).first()
        if not db_order and customer_id:
            db_order = Order(
                order_id=order_id,
                order_code=f"#ORD-{order_id.replace('ORD-', '')}",
                customer_id=customer_id,
                product_id=product_id,
                category=category,
                order_value=order_value,
                currency="INR",
                order_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                formatted_date=datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p"),
                payment_method=ml_features["payment_method"],
                delivery_type=ml_features["delivery_type"],
                delivery_status="Processing",
                delivery_delay_days=ml_features["delivery_delay_days"],
                number_of_items=ml_features["number_of_items"],
                is_multi_size_order=ml_features["is_multi_size_order"],
                discount_percent=ml_features["discount_percent"],
                created_at=datetime.now(timezone.utc)
            )
            db.add(db_order)
            db.commit()
            db.refresh(db_order)

        # Create ReturnPrediction entry
        prediction_record = ReturnPrediction(
            prediction_id=f"PRED-{uuid.uuid4().hex[:8].upper()}",
            order_id=order_id,
            return_probability=prob,
            risk_score=score,
            risk_level=risk_level,
            revenue_at_risk=revenue_at_risk,
            risk_factors=top_factors,
            model_version=model_version,
            created_at=datetime.now(timezone.utc)
        )
        db.add(prediction_record)
        
        # Log Audit Event for model evaluation
        badge = "red" if risk_level == "HIGH" else ("amber" if risk_level == "MEDIUM" else "emerald")
        log_audit_event(
            db=db,
            actor="AI Inference Engine",
            action_type="MODEL_EVAL",
            event_name=f"Return Risk Scored: {score}/100 ({risk_level})",
            order_id=order_id,
            return_probability=f"{score}%",
            model_version=model_version,
            details=f"Calculated return probability of {prob*100:.1f}% with Revenue at Risk ₹{revenue_at_risk:,.2f}.",
            badge_color=badge,
            event_metadata={"risk_score": score, "revenue_at_risk": revenue_at_risk}
        )

        # If HIGH risk or exceeds auto-flag threshold, automatically open an intervention case
        if prob >= thresholds["high_min"]:
            existing_case = db.query(ReturnIntervention).filter(ReturnIntervention.order_id == order_id).first()
            if not existing_case:
                case_id = f"RR-{1000 + (hash(order_id) % 9000)}"
                now_utc = datetime.now(timezone.utc)
                case_record = ReturnIntervention(
                    intervention_id=f"INT-{uuid.uuid4().hex[:8].upper()}",
                    order_id=order_id,
                    case_id=case_id,
                    action="REVIEW",
                    priority="High",
                    status="Open",
                    reviewer="Senior Risk Operations Analyst",
                    risk_summary=f"High probability return prediction ({score}%) with ₹{revenue_at_risk:,.0f} revenue at risk.",
                    notes=[
                        {
                            "author": "AI System",
                            "date": now_utc.strftime("%d %b %Y, %I:%M %p"),
                            "text": f"Order evaluated by {model_version}. Return risk score {score}/100 generated."
                        }
                    ],
                    created_at=now_utc,
                    updated_at=now_utc
                )
                db.add(case_record)
                
                log_audit_event(
                    db=db,
                    actor="AI Inference Engine",
                    action_type="RISK_FLAG",
                    event_name=f"High Return-Risk Case #{case_id} Opened",
                    order_id=order_id,
                    return_probability=f"{score}%",
                    model_version=model_version,
                    details=f"Order flagged for merchant review. High risk factors: {', '.join([f['name'] for f in top_factors[:2]])}",
                    badge_color="red"
                )

        db.commit()

    return result_payload
