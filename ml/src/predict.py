"""
Inference & Prediction Service for AI Return-Risk Scorer.
Provides clean `predict_return_risk(order_dict)` interface with feature explanations.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

try:
    from ml.config import (
        MODEL_NAME,
        MODEL_VERSION,
        RISK_THRESHOLDS,
        ALL_INPUT_FEATURES
    )
    from ml.src.explain import explain_order_prediction
except ImportError:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from config import (
        MODEL_NAME,
        MODEL_VERSION,
        RISK_THRESHOLDS,
        ALL_INPUT_FEATURES
    )
    from src.explain import explain_order_prediction

class ReturnRiskPredictor:
    def __init__(self, model_path=None, metadata_path=None):
        possible_model_paths = [
            model_path,
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models', 'best_model.joblib')),
            os.path.abspath(os.path.join(os.getcwd(), 'ml', 'models', 'best_model.joblib')),
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'models', 'best_model.joblib')),
            os.path.abspath(os.path.join('/var/task', 'ml', 'models', 'best_model.joblib'))
        ]
        
        resolved_model_path = None
        for p in possible_model_paths:
            if p and os.path.exists(p):
                resolved_model_path = p
                break

        possible_meta_paths = [
            metadata_path,
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models', 'model_metadata.json')),
            os.path.abspath(os.path.join(os.getcwd(), 'ml', 'models', 'model_metadata.json')),
            os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'models', 'model_metadata.json')),
            os.path.abspath(os.path.join('/var/task', 'ml', 'models', 'model_metadata.json'))
        ]
        
        resolved_meta_path = None
        for m in possible_meta_paths:
            if m and os.path.exists(m):
                resolved_meta_path = m
                break

        self.model = None
        if resolved_model_path:
            try:
                self.model = joblib.load(resolved_model_path)
            except Exception as e:
                print(f"[WARN] Failed to load joblib model at {resolved_model_path}: {e}")
                self.model = None
        
        self.metadata = {}
        if resolved_meta_path:
            try:
                with open(resolved_meta_path, 'r') as f:
                    self.metadata = json.load(f)
            except Exception as e:
                print(f"[WARN] Failed to read metadata at {resolved_meta_path}: {e}")
                
        self.feature_importances = self.metadata.get("top_feature_importances", [])

    def predict(self, order):
        """
        Main prediction function.
        Takes order dictionary and returns structured return-risk assessment.
        """
        order_dict = dict(order)
        order_id = str(order_dict.get("order_id", order_dict.get("id", "ORD-UNKNOWN")))
        order_val = float(order_dict.get("order_value", order_dict.get("value", 0.0)))
        
        # Prepare feature vector DataFrame matching training schema
        df_row = {}
        for feat in ALL_INPUT_FEATURES:
            if feat in order_dict:
                df_row[feat] = order_dict[feat]
            else:
                # Handle nested customer or product dicts from frontend formats
                if feat == "customer_historical_return_rate":
                    df_row[feat] = float(order_dict.get("customer", {}).get("returnRate", 15.0)) / 100.0 if isinstance(order_dict.get("customer"), dict) else float(order_dict.get("customer_return_rate", 0.15))
                elif feat == "customer_order_count":
                    df_row[feat] = int(order_dict.get("customer", {}).get("totalOrders", 1)) if isinstance(order_dict.get("customer"), dict) else int(order_dict.get("customer_total_orders", 1))
                elif feat == "customer_previous_return_count":
                    df_row[feat] = int(order_dict.get("customer", {}).get("totalReturns", 0)) if isinstance(order_dict.get("customer"), dict) else int(order_dict.get("customer_previous_returns", 0))
                elif feat == "customer_previous_cancel_count":
                    df_row[feat] = int(order_dict.get("customer", {}).get("cancellations", 0)) if isinstance(order_dict.get("customer"), dict) else 0
                elif feat == "customer_avg_order_value":
                    df_row[feat] = float(order_dict.get("customer", {}).get("avgOrderValue", order_val)) if isinstance(order_dict.get("customer"), dict) else order_val
                elif feat == "product_category":
                    df_row[feat] = str(order_dict.get("category", order_dict.get("product", {}).get("category", "Apparel"))) if isinstance(order_dict.get("product"), dict) else str(order_dict.get("category", "Apparel"))
                elif feat == "product_historical_return_rate":
                    df_row[feat] = float(order_dict.get("product", {}).get("productReturnRate", 20.0)) / 100.0 if isinstance(order_dict.get("product"), dict) else 0.20
                elif feat == "category_historical_return_rate":
                    df_row[feat] = float(order_dict.get("product", {}).get("categoryReturnRate", 18.0)) / 100.0 if isinstance(order_dict.get("product"), dict) else (0.30 if "Apparel" in str(order_dict.get("category", "")) else 0.16)
                elif feat == "order_value":
                    df_row[feat] = order_val
                elif feat == "order_value_deviation":
                    avg_v = float(order_dict.get("customer_avg_order_value", order_val))
                    df_row[feat] = (order_val - avg_v) / avg_v if avg_v > 0 else 0.0
                elif feat == "delivery_delay_days":
                    df_row[feat] = int(order_dict.get("delivery_delay_days", 0))
                elif feat == "number_of_items":
                    df_row[feat] = int(order_dict.get("number_of_items", 1))
                elif feat == "is_multi_size_order":
                    df_row[feat] = int(order_dict.get("is_multi_size_order", 0))
                elif feat == "discount_percent":
                    df_row[feat] = float(order_dict.get("discount_percent", 0.0))
                elif feat == "is_first_time_customer":
                    df_row[feat] = int(order_dict.get("is_first_time_customer", 0))
                elif feat == "payment_method":
                    df_row[feat] = str(order_dict.get("payment_method", order_dict.get("paymentMethod", "UPI")))
                elif feat == "delivery_type":
                    df_row[feat] = str(order_dict.get("delivery_type", "Standard"))
                else:
                    df_row[feat] = 0.0

        X_input = pd.DataFrame([df_row])
        
        # Inference (Model-based or Weighted Ensemble Fallback)
        if self.model is not None:
            try:
                prob = float(self.model.predict_proba(X_input)[0, 1])
            except Exception as e:
                print(f"[WARN] Inference exception: {e}. Using feature-weighted scoring fallback.")
                prob = self._compute_weighted_prob(df_row)
        else:
            prob = self._compute_weighted_prob(df_row)

        risk_score = int(round(prob * 100))
        
        # Determine Risk Level based on centralized thresholds
        if prob >= RISK_THRESHOLDS["HIGH_MIN"]:
            risk_level = "HIGH"
        elif prob > RISK_THRESHOLDS["LOW_MAX"]:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            
        # Calculate Illustrative Revenue at Risk in INR
        revenue_at_risk = round(order_val * prob, 2)
        
        # Generate Feature Attribution Explanations
        top_factors = explain_order_prediction(
            order_dict=df_row,
            feature_names=ALL_INPUT_FEATURES,
            feature_importances=self.feature_importances,
            baseline_prob=0.20
        )
        
        return {
            "order_id": order_id,
            "return_probability": round(prob, 4),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "order_value_inr": order_val,
            "revenue_at_risk_inr": revenue_at_risk,
            "top_risk_factors": top_factors,
            "model_version": MODEL_VERSION
        }

    def _compute_weighted_prob(self, df_row: dict) -> float:
        """Computes statistical baseline return probability grounded in Stage 3 feature importances."""
        cust_rate = float(df_row.get("customer_historical_return_rate", 0.15))
        is_multi = int(df_row.get("is_multi_size_order", 0))
        cat_rate = float(df_row.get("category_historical_return_rate", 0.18))
        delay = int(df_row.get("delivery_delay_days", 0))
        payment = str(df_row.get("payment_method", "UPI"))
        discount = float(df_row.get("discount_percent", 0.0))

        # Base weighted calculation
        score = (
            0.38 * cust_rate +
            0.32 * (0.80 if is_multi else 0.10) +
            0.15 * cat_rate +
            0.08 * (0.65 if "COD" in payment.upper() or "CASH" in payment.upper() else 0.15) +
            0.04 * min(1.0, delay * 0.25) +
            0.03 * min(1.0, discount / 50.0)
        )
        return min(0.96, max(0.04, round(score, 4)))

# Global singleton predictor instance
_predictor_instance = None

def predict_return_risk(order):
    """
    Convenience function to predict return risk for an order.
    """
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = ReturnRiskPredictor()
    return _predictor_instance.predict(order)

if __name__ == "__main__":
    predictor = ReturnRiskPredictor()
    
    # Test Order 1: High Return Risk (Bracket buying + High return customer)
    test_order_1 = {
        "order_id": "ORD-TEST-001",
        "customer_id": "CUST-8492-AX",
        "product_category": "Apparel",
        "order_value": 7490.0,
        "payment_method": "COD",
        "delivery_type": "Standard",
        "delivery_delay_days": 3,
        "number_of_items": 2,
        "is_multi_size_order": 1,
        "customer_order_count": 14,
        "customer_previous_return_count": 6,
        "customer_previous_cancel_count": 2,
        "customer_historical_return_rate": 0.428,
        "customer_avg_order_value": 3500.0,
        "order_value_deviation": 1.14,
        "product_historical_return_rate": 0.38,
        "category_historical_return_rate": 0.30,
        "discount_percent": 15.0,
        "is_first_time_customer": 0
    }
    
    # Test Order 2: Low Return Risk (Loyal buyer, staple item, prepaid)
    test_order_2 = {
        "order_id": "ORD-TEST-002",
        "customer_id": "CUST-1049-HY",
        "product_category": "Apparel",
        "order_value": 1890.0,
        "payment_method": "UPI",
        "delivery_type": "Express",
        "delivery_delay_days": 0,
        "number_of_items": 1,
        "is_multi_size_order": 0,
        "customer_order_count": 32,
        "customer_previous_return_count": 1,
        "customer_previous_cancel_count": 0,
        "customer_historical_return_rate": 0.031,
        "customer_avg_order_value": 2800.0,
        "order_value_deviation": -0.32,
        "product_historical_return_rate": 0.06,
        "category_historical_return_rate": 0.22,
        "discount_percent": 0.0,
        "is_first_time_customer": 0
    }
    
    res1 = predictor.predict(test_order_1)
    res2 = predictor.predict(test_order_2)
    
    print("\n--- TEST PREDICTION 1 (Expected High Risk) ---")
    print(json.dumps(res1, indent=2))
    
    print("\n--- TEST PREDICTION 2 (Expected Low Risk) ---")
    print(json.dumps(res2, indent=2))
