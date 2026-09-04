"""
Comprehensive Database Seed Script for AI Order Return-Risk Scorer.
Populates SQLite database with realistic customers, products, orders, predictions, interventions, and audit events.
All monetary figures strictly in INR (₹).
"""

import os
import sys
import json
from datetime import datetime, timedelta, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.database import engine, Base, SessionLocal
from backend.models import (
    Customer,
    Product,
    Order,
    ReturnPrediction,
    ReturnIntervention,
    AuditEvent,
    ModelVersion,
    ReturnSettings
)
from backend.services.prediction_service import predict_return_risk_for_order

def seed_database():
    print("--- 1. Creating Database Schema ---")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("--- 2. Seeding Settings & Model Metadata ---")
        # 1. Settings
        settings = ReturnSettings(
            setting_id="default",
            low_risk_threshold=39,
            medium_risk_threshold=40,
            high_risk_threshold=70,
            auto_flag_threshold=80,
            enable_realtime_inference=True,
            notify_email=True,
            notify_slack=False,
            active_engine="ReturnGuard-Ensemble (Random Forest)",
            currency_symbol="₹",
            currency_code="INR",
            locale="en-IN",
            updated_at=datetime.now(timezone.utc)
        )
        db.add(settings)

        # 2. Model Version
        meta_file = os.path.join(PROJECT_ROOT, "ml", "models", "model_metadata.json")
        meta_data = {}
        if os.path.exists(meta_file):
            with open(meta_file, "r") as f:
                meta_data = json.load(f)

        cm = meta_data.get("champion_metrics", {}).get("confusion_matrix", {
            "true_positive": 218,
            "false_positive": 369,
            "false_negative": 195,
            "true_negative": 2218
        })
        cm_camel = {
            "truePositive": cm.get("true_positive", 218),
            "falsePositive": cm.get("false_positive", 369),
            "falseNegative": cm.get("false_negative", 195),
            "trueNegative": cm.get("true_negative", 2218)
        }

        model_ver = ModelVersion(
            version_id="v1.0",
            model_name="ReturnGuard-Ensemble",
            model_version="order-return-risk-model-v1.0",
            champion_algorithm="Random Forest Classifier",
            training_date="Aug 2026",
            dataset_version="synthetic-ecommerce-orders-v1.0",
            training_dataset_size="12,000 Orders",
            test_dataset_size="3,000 Orders (Time-Aware Split)",
            accuracy="81.2%",
            precision="37.1%",
            recall="52.8%",
            f1_score="43.6%",
            roc_auc="0.7541",
            false_positive_rate="14.3%",
            est_fp_cost_inr=18450,
            confusion_matrix=cm_camel,
            top_feature_importances=meta_data.get("top_feature_importances", []),
            all_model_comparison=meta_data.get("all_model_comparison", {}),
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        db.add(model_ver)
        db.commit()

        print("--- 3. Seeding Customers ---")
        customers_data = [
            {
                "customer_id": "CUST-8492-AX",
                "customer_name": "Priya Sharma",
                "email": "priya.sharma@example.in",
                "location": "Bengaluru, Karnataka",
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                "total_orders": 14,
                "previous_returns": 6,
                "previous_cancellations": 2,
                "historical_return_rate": 0.428,
                "average_order_value": 4500.0,
                "customer_segment": "Frequent Returner",
                "notes": "High return propensity in premium electronics and size-sensitive apparel."
            },
            {
                "customer_id": "CUST-3921-ND",
                "customer_name": "Vikram Patel",
                "email": "vikram.p@example.in",
                "location": "Mumbai, Maharashtra",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "total_orders": 8,
                "previous_returns": 2,
                "previous_cancellations": 1,
                "historical_return_rate": 0.25,
                "average_order_value": 7200.0,
                "customer_segment": "Medium Risk",
                "notes": "Prefers premium furniture items. Occasionally returns due to dimensions."
            },
            {
                "customer_id": "CUST-9921-DL",
                "customer_name": "Ananya Sen",
                "email": "ananya.s@example.in",
                "location": "New Delhi, Delhi",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "total_orders": 26,
                "previous_returns": 14,
                "previous_cancellations": 5,
                "historical_return_rate": 0.538,
                "average_order_value": 3200.0,
                "customer_segment": "High-Risk Returner",
                "notes": "Frequent bracket purchaser of apparel and multi-size fashion."
            },
            {
                "customer_id": "CUST-1049-HY",
                "customer_name": "Rahul Varma",
                "email": "rahul.v@example.in",
                "location": "Hyderabad, Telangana",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "total_orders": 32,
                "previous_returns": 1,
                "previous_cancellations": 0,
                "historical_return_rate": 0.031,
                "average_order_value": 2800.0,
                "customer_segment": "VIP Loyal Buyer",
                "notes": "Extremely low return risk. High lifetime loyalty."
            },
            {
                "customer_id": "CUST-5582-PN",
                "customer_name": "Pooja Hegde",
                "email": "pooja.h@example.in",
                "location": "Pune, Maharashtra",
                "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
                "total_orders": 5,
                "previous_returns": 2,
                "previous_cancellations": 0,
                "historical_return_rate": 0.40,
                "average_order_value": 4100.0,
                "customer_segment": "New Customer",
                "notes": "Returned past footwear due to half-size mismatch."
            },
            {
                "customer_id": "CUST-7712-CH",
                "customer_name": "Rohan Gupta",
                "email": "rohan.g@example.in",
                "location": "Chennai, Tamil Nadu",
                "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
                "total_orders": 19,
                "previous_returns": 3,
                "previous_cancellations": 1,
                "historical_return_rate": 0.157,
                "average_order_value": 8500.0,
                "customer_segment": "Standard Customer",
                "notes": "Reliable buyer. Minimal returns."
            },
            {
                "customer_id": "CUST-4109-KL",
                "customer_name": "Suresh Nair",
                "email": "suresh.n@example.in",
                "location": "Kochi, Kerala",
                "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
                "total_orders": 11,
                "previous_returns": 4,
                "previous_cancellations": 2,
                "historical_return_rate": 0.363,
                "average_order_value": 3900.0,
                "customer_segment": "Price Sensitive",
                "notes": "Orders grooming kits on COD."
            }
        ]

        for cd in customers_data:
            c = Customer(
                customer_id=cd["customer_id"],
                customer_name=cd["customer_name"],
                email=cd["email"],
                location=cd["location"],
                avatar_url=cd["avatar_url"],
                total_orders=cd["total_orders"],
                previous_returns=cd["previous_returns"],
                previous_cancellations=cd["previous_cancellations"],
                historical_return_rate=cd["historical_return_rate"],
                average_order_value=cd["average_order_value"],
                customer_segment=cd["customer_segment"],
                notes=cd["notes"],
                created_at=datetime.now(timezone.utc) - timedelta(days=90)
            )
            db.add(c)
        db.commit()

        print("--- 4. Seeding Products ---")
        products_data = [
            {
                "product_id": "PROD-HEADPHONE-PRO",
                "product_name": "AcousticWave Wireless ANC Headphones (Midnight Black)",
                "sku": "ELE-HD-902",
                "category": "Electronics",
                "price": 12490.0,
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
                "historical_return_rate": 0.245,
                "category_return_rate": 0.182,
                "common_return_reasons": ["Sound signature preference (42%)", "Price buyer remorse (31%)", "Ear cushion clamp pressure (27%)"]
            },
            {
                "product_id": "PROD-LAMP-DESK",
                "product_name": "Lumina Curve Ergonomic Smart Desk Lamp",
                "sku": "HOM-LMP-401",
                "category": "Furniture & Home",
                "price": 18990.0,
                "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop&q=80",
                "historical_return_rate": 0.168,
                "category_return_rate": 0.140,
                "common_return_reasons": ["Desk clamp width incompatibility (55%)", "Color temperature mismatch (45%)"]
            },
            {
                "product_id": "PROD-DRESS-SUMMER",
                "product_name": "Floral Print Pure Georgette Summer Maxi Dress",
                "sku": "APP-DRS-112",
                "category": "Apparel",
                "price": 7490.0,
                "image_url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&auto=format&fit=crop&q=80",
                "historical_return_rate": 0.380,
                "category_return_rate": 0.315,
                "common_return_reasons": ["Size fit too loose/tight (64%)", "Fabric sheer transparency (22%)", "Color variant difference (14%)"]
            },
            {
                "product_id": "PROD-TEE-COMBO",
                "product_name": "Organic Combed Cotton Tee Pack of 3",
                "sku": "APP-TEE-003",
                "category": "Apparel",
                "price": 1890.0,
                "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80",
                "historical_return_rate": 0.062,
                "category_return_rate": 0.220,
                "common_return_reasons": ["Fabric feel (50%)", "Size small (50%)"]
            },
            {
                "product_id": "PROD-SHOE-RUN",
                "product_name": "NitroStride Carbon Running Shoes (UK 8)",
                "sku": "FTW-RUN-880",
                "category": "Footwear",
                "price": 6490.0,
                "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80",
                "historical_return_rate": 0.321,
                "category_return_rate": 0.284,
                "common_return_reasons": ["Half size tight (60%)", "Arch support comfort (25%)", "Defective lace eyelet (15%)"]
            },
            {
                "product_id": "PROD-AIR-PURIFIER",
                "product_name": "AeroClean True HEPA Smart Air Purifier 450",
                "sku": "HOM-AIR-205",
                "category": "Furniture & Home",
                "price": 11990.0,
                "image_url": "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300&auto=format&fit=crop&q=80",
                "historical_return_rate": 0.095,
                "category_return_rate": 0.120,
                "common_return_reasons": ["Fan noise level at max speed (70%)", "Filter replacement cost (30%)"]
            },
            {
                "product_id": "PROD-GROOM-KIT",
                "product_name": "UltraGroom 9-in-1 Precision Titanium Styling Kit",
                "sku": "PER-GRM-091",
                "category": "Personal Care",
                "price": 3490.0,
                "image_url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=300&auto=format&fit=crop&q=80",
                "historical_return_rate": 0.210,
                "category_return_rate": 0.150,
                "common_return_reasons": ["Battery life (50%)", "Non-returnable policy query (50%)"]
            }
        ]

        for pd in products_data:
            p = Product(
                product_id=pd["product_id"],
                product_name=pd["product_name"],
                sku=pd["sku"],
                category=pd["category"],
                price=pd["price"],
                image_url=pd["image_url"],
                historical_return_rate=pd["historical_return_rate"],
                category_return_rate=pd["category_return_rate"],
                common_return_reasons=pd["common_return_reasons"],
                created_at=datetime.now(timezone.utc) - timedelta(days=120)
            )
            db.add(p)
        db.commit()

        print("--- 5. Seeding Orders and Generating Stage 3 ML Predictions ---")
        orders_data = [
            {
                "order_id": "8921",
                "customer_id": "CUST-8492-AX",
                "product_id": "PROD-HEADPHONE-PRO",
                "category": "Electronics",
                "order_value": 12490.0,
                "order_date": "2026-08-24",
                "formatted_date": "24 Aug 2026, 02:45 PM",
                "payment_method": "Razorpay UPI (Axis Bank)",
                "delivery_type": "Standard",
                "delivery_status": "Processing",
                "delivery_date": "Expected 28 Aug 2026",
                "shipping_city": "Bengaluru",
                "delivery_delay_days": 2,
                "number_of_items": 1,
                "is_multi_size_order": 0,
                "discount_percent": 10.0
            },
            {
                "order_id": "8920",
                "customer_id": "CUST-3921-ND",
                "product_id": "PROD-LAMP-DESK",
                "category": "Furniture & Home",
                "order_value": 18990.0,
                "order_date": "2026-08-25",
                "formatted_date": "25 Aug 2026, 11:20 AM",
                "payment_method": "Razorpay Cards (HDFC Bank)",
                "delivery_type": "Express",
                "delivery_status": "Shipped",
                "delivery_date": "Expected 27 Aug 2026",
                "shipping_city": "Mumbai",
                "delivery_delay_days": 0,
                "number_of_items": 1,
                "is_multi_size_order": 0,
                "discount_percent": 5.0
            },
            {
                "order_id": "8919",
                "customer_id": "CUST-9921-DL",
                "product_id": "PROD-DRESS-SUMMER",
                "category": "Apparel",
                "order_value": 7490.0,
                "order_date": "2026-08-25",
                "formatted_date": "25 Aug 2026, 04:10 PM",
                "payment_method": "Cash on Delivery (COD)",
                "delivery_type": "Standard",
                "delivery_status": "Processing",
                "delivery_date": "Expected 29 Aug 2026",
                "shipping_city": "New Delhi",
                "delivery_delay_days": 1,
                "number_of_items": 2,
                "is_multi_size_order": 1, # Bracket buying!
                "discount_percent": 20.0
            },
            {
                "order_id": "8918",
                "customer_id": "CUST-1049-HY",
                "product_id": "PROD-TEE-COMBO",
                "category": "Apparel",
                "order_value": 1890.0,
                "order_date": "2026-08-25",
                "formatted_date": "25 Aug 2026, 06:15 PM",
                "payment_method": "Razorpay Netbanking (SBI)",
                "delivery_type": "Express",
                "delivery_status": "Processing",
                "delivery_date": "Expected 29 Aug 2026",
                "shipping_city": "Hyderabad",
                "delivery_delay_days": 0,
                "number_of_items": 1,
                "is_multi_size_order": 0,
                "discount_percent": 0.0
            },
            {
                "order_id": "8917",
                "customer_id": "CUST-5582-PN",
                "product_id": "PROD-SHOE-RUN",
                "category": "Footwear",
                "order_value": 6490.0,
                "order_date": "2026-08-26",
                "formatted_date": "26 Aug 2026, 09:30 AM",
                "payment_method": "Razorpay Cards (Axis Bank)",
                "delivery_type": "Standard",
                "delivery_status": "Processing",
                "delivery_date": "Expected 30 Aug 2026",
                "shipping_city": "Pune",
                "delivery_delay_days": 0,
                "number_of_items": 1,
                "is_multi_size_order": 0,
                "discount_percent": 10.0
            },
            {
                "order_id": "8916",
                "customer_id": "CUST-7712-CH",
                "product_id": "PROD-AIR-PURIFIER",
                "category": "Furniture & Home",
                "order_value": 11990.0,
                "order_date": "2026-08-26",
                "formatted_date": "26 Aug 2026, 11:45 AM",
                "payment_method": "Razorpay UPI (ICICI Bank)",
                "delivery_type": "Express",
                "delivery_status": "Delivered",
                "delivery_date": "Delivered 26 Aug",
                "shipping_city": "Chennai",
                "delivery_delay_days": 0,
                "number_of_items": 1,
                "is_multi_size_order": 0,
                "discount_percent": 0.0
            },
            {
                "order_id": "8915",
                "customer_id": "CUST-4109-KL",
                "product_id": "PROD-GROOM-KIT",
                "category": "Personal Care",
                "order_value": 3490.0,
                "order_date": "2026-08-26",
                "formatted_date": "26 Aug 2026, 01:15 PM",
                "payment_method": "Cash on Delivery (COD)",
                "delivery_type": "Standard",
                "delivery_status": "Processing",
                "delivery_date": "Expected 31 Aug 2026",
                "shipping_city": "Kochi",
                "delivery_delay_days": 1,
                "number_of_items": 1,
                "is_multi_size_order": 0,
                "discount_percent": 15.0
            }
        ]

        for od in orders_data:
            order = Order(
                order_id=od["order_id"],
                order_code=f"#ORD-{od['order_id']}",
                customer_id=od["customer_id"],
                product_id=od["product_id"],
                category=od["category"],
                order_value=od["order_value"],
                currency="INR",
                order_date=od["order_date"],
                formatted_date=od["formatted_date"],
                payment_method=od["payment_method"],
                delivery_type=od["delivery_type"],
                delivery_status=od["delivery_status"],
                delivery_date=od["delivery_date"],
                shipping_city=od["shipping_city"],
                delivery_delay_days=od["delivery_delay_days"],
                number_of_items=od["number_of_items"],
                is_multi_size_order=od["is_multi_size_order"],
                discount_percent=od["discount_percent"],
                created_at=datetime.now(timezone.utc) - timedelta(hours=int(od["order_id"]) % 48)
            )
            db.add(order)
            db.commit()

            # Execute real ML Return-Risk Prediction for each order
            pred_res = predict_return_risk_for_order(
                db=db,
                order_input={
                    "order_id": order.order_id,
                    "customer_id": order.customer_id,
                    "product_id": order.product_id,
                    "order_value": order.order_value,
                    "product_category": order.category,
                    "payment_method": order.payment_method,
                    "delivery_type": order.delivery_type,
                    "delivery_delay_days": order.delivery_delay_days,
                    "number_of_items": order.number_of_items,
                    "is_multi_size_order": order.is_multi_size_order,
                    "discount_percent": order.discount_percent
                },
                persist=True
            )
            print(f"  -> Seeded Order #{order.order_id}: Prob={pred_res['return_probability']*100:.1f}%, Score={pred_res['risk_score']}, Tier={pred_res['risk_level']}")

        print("--- 6. Seeding Interventions and Review Cases ---")
        interventions_data = [
            {
                "order_id": "8921",
                "case_id": "RR-1021",
                "action": "REVIEW",
                "priority": "High",
                "status": "Open",
                "reviewer": "Jane Doe (Senior Risk Analyst)",
                "risk_summary": "High probability return prediction driven by customer return history (42.8%) and premium audio price ticket (₹12,490).",
                "notes": [
                    { "author": "AI System", "date": "24 Aug 2026, 02:46 PM", "text": "Order evaluated. Return risk score calculated." },
                    { "author": "Jane Doe", "date": "26 Aug 2026, 10:15 AM", "text": "Customer contacted support regarding return policy details prior to delivery." }
                ]
            },
            {
                "order_id": "8920",
                "case_id": "RR-1022",
                "action": "CUSTOMER_OUTREACH",
                "priority": "Medium",
                "status": "Under Review",
                "reviewer": "Jane Doe (Senior Risk Analyst)",
                "risk_summary": "Medium probability return on bulky ergonomic furniture item.",
                "notes": [
                    { "author": "AI System", "date": "25 Aug 2026, 11:22 AM", "text": "Order evaluated. Return risk score calculated." }
                ]
            },
            {
                "order_id": "8919",
                "case_id": "RR-1023",
                "action": "REVIEW",
                "priority": "High",
                "status": "Open",
                "reviewer": "Jane Doe (Senior Risk Analyst)",
                "risk_summary": "High probability return due to bracket purchasing of sizes M and L on COD.",
                "notes": [
                    { "author": "AI System", "date": "25 Aug 2026, 04:12 PM", "text": "Bracket purchase multi-size flag triggered." }
                ]
            }
        ]

        for iv in interventions_data:
            existing = db.query(ReturnIntervention).filter(ReturnIntervention.order_id == iv["order_id"]).first()
            if existing:
                existing.case_id = iv["case_id"]
                existing.action = iv["action"]
                existing.priority = iv["priority"]
                existing.status = iv["status"]
                existing.reviewer = iv["reviewer"]
                existing.risk_summary = iv["risk_summary"]
                existing.notes = iv["notes"]
            else:
                new_iv = ReturnIntervention(
                    intervention_id=f"INT-{iv['case_id']}",
                    order_id=iv["order_id"],
                    case_id=iv["case_id"],
                    action=iv["action"],
                    priority=iv["priority"],
                    status=iv["status"],
                    reviewer=iv["reviewer"],
                    risk_summary=iv["risk_summary"],
                    notes=iv["notes"],
                    created_at=datetime.now(timezone.utc) - timedelta(hours=12),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(new_iv)
        db.commit()

        print("--- 7. Seeding Historical Audit Events ---")
        historical_audit = [
            {
                "event_id": "AUD-991",
                "order_id": "8915",
                "actor": "AI Inference Engine",
                "action_type": "MODEL_EVAL",
                "event_name": "Model Prediction Generated",
                "return_probability": "41%",
                "model_version": "ReturnGuard-Ensemble v1.0",
                "details": "Predicted Medium return risk (41%) for UltraGroom 9-in-1 Kit (COD order).",
                "badge_color": "amber",
                "created_at": datetime.now(timezone.utc) - timedelta(hours=2)
            },
            {
                "event_id": "AUD-990",
                "order_id": "8916",
                "actor": "AI Inference Engine",
                "action_type": "MODEL_EVAL",
                "event_name": "Model Prediction Generated",
                "return_probability": "19%",
                "model_version": "ReturnGuard-Ensemble v1.0",
                "details": "Predicted Low return risk (19%) for AeroClean Purifier. Verified loyal buyer.",
                "badge_color": "emerald",
                "created_at": datetime.now(timezone.utc) - timedelta(hours=4)
            },
            {
                "event_id": "AUD-989",
                "order_id": "8917",
                "actor": "AI Inference Engine",
                "action_type": "RISK_FLAG",
                "event_name": "Flagged High Return Risk",
                "return_probability": "33%",
                "model_version": "ReturnGuard-Ensemble v1.0",
                "details": "Footwear category UK 8 sizing mismatch review flag.",
                "badge_color": "amber",
                "created_at": datetime.now(timezone.utc) - timedelta(hours=6)
            },
            {
                "event_id": "AUD-988",
                "order_id": "8919",
                "actor": "AI Inference Engine",
                "action_type": "RISK_FLAG",
                "event_name": "Bracket Purchasing Anomaly Flagged",
                "return_probability": "66%",
                "model_version": "ReturnGuard-Ensemble v1.0",
                "details": "Multi-size dress order on COD flagged with elevated return likelihood.",
                "badge_color": "red",
                "created_at": datetime.now(timezone.utc) - timedelta(hours=8)
            },
            {
                "event_id": "AUD-987",
                "order_id": "8920",
                "actor": "Jane Doe (Merchant Reviewer)",
                "action_type": "MERCHANT_ACTION",
                "event_name": "Merchant Review: Verification Requested",
                "return_probability": "28%",
                "model_version": "ReturnGuard-Ensemble v1.0",
                "details": "Merchant initiated customer WhatsApp confirmation for furniture assembly requirements.",
                "badge_color": "blue",
                "created_at": datetime.now(timezone.utc) - timedelta(hours=14)
            },
            {
                "event_id": "AUD-986",
                "order_id": "8921",
                "actor": "AI Inference Engine",
                "action_type": "MODEL_EVAL",
                "event_name": "Return Risk Model Evaluated",
                "return_probability": "34%",
                "model_version": "ReturnGuard-Ensemble v1.0",
                "details": "Model scored Order #8921 with Revenue at Risk ₹4,221. Case #RR-1021 opened.",
                "badge_color": "amber",
                "created_at": datetime.now(timezone.utc) - timedelta(hours=24)
            },
            {
                "event_id": "AUD-985",
                "order_id": "8921",
                "actor": "Razorpay Webhook",
                "action_type": "SYSTEM_INGEST",
                "event_name": "Order Received from Razorpay Gateway",
                "return_probability": "-",
                "model_version": "-",
                "details": "Order #8921 ingested with amount ₹12,490 (UPI transaction).",
                "badge_color": "slate",
                "created_at": datetime.now(timezone.utc) - timedelta(hours=25)
            }
        ]

        for ae in historical_audit:
            event = AuditEvent(
                event_id=ae["event_id"],
                order_id=ae["order_id"],
                actor=ae["actor"],
                action_type=ae["action_type"],
                event_name=ae["event_name"],
                return_probability=ae["return_probability"],
                model_version=ae["model_version"],
                details=ae["details"],
                badge_color=ae["badge_color"],
                created_at=ae["created_at"]
            )
            db.add(event)
        db.commit()

        print(f"\n[SUCCESS] SQLite Database seeded successfully at: {engine.url.database}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
