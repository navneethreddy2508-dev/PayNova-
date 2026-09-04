"""
Script to synchronize trained ML model evaluations, predictions, and feature attributions
with the frontend data store.
"""

import os
import sys
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
from src.predict import ReturnRiskPredictor

def export_ml_artifacts_to_frontend():
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
    metadata_path = os.path.join(models_dir, 'model_metadata.json')
    
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Model metadata not found at {metadata_path}. Train the model first.")
        
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
        
    predictor = ReturnRiskPredictor()
    
    # Test orders corresponding to prototype
    prototype_orders = [
        {
            "id": "8921",
            "order_value": 12490,
            "payment_method": "UPI",
            "delivery_delay_days": 2,
            "number_of_items": 1,
            "is_multi_size_order": 0,
            "customer_order_count": 14,
            "customer_previous_return_count": 6,
            "customer_previous_cancel_count": 2,
            "customer_historical_return_rate": 0.428,
            "customer_avg_order_value": 4500,
            "order_value_deviation": 1.77,
            "product_category": "Electronics",
            "product_historical_return_rate": 0.245,
            "category_historical_return_rate": 0.182,
            "discount_percent": 10.0,
            "is_first_time_customer": 0
        },
        {
            "id": "8920",
            "order_value": 18990,
            "payment_method": "Credit Card",
            "delivery_delay_days": 0,
            "number_of_items": 1,
            "is_multi_size_order": 0,
            "customer_order_count": 8,
            "customer_previous_return_count": 2,
            "customer_previous_cancel_count": 1,
            "customer_historical_return_rate": 0.25,
            "customer_avg_order_value": 7200,
            "order_value_deviation": 1.63,
            "product_category": "Furniture & Home",
            "product_historical_return_rate": 0.168,
            "category_historical_return_rate": 0.14,
            "discount_percent": 5.0,
            "is_first_time_customer": 0
        },
        {
            "id": "8919",
            "order_value": 7490,
            "payment_method": "COD",
            "delivery_delay_days": 1,
            "number_of_items": 2,
            "is_multi_size_order": 1,
            "customer_order_count": 26,
            "customer_previous_return_count": 14,
            "customer_previous_cancel_count": 5,
            "customer_historical_return_rate": 0.538,
            "customer_avg_order_value": 3200,
            "order_value_deviation": 1.34,
            "product_category": "Apparel",
            "product_historical_return_rate": 0.38,
            "category_historical_return_rate": 0.315,
            "discount_percent": 20.0,
            "is_first_time_customer": 0
        },
        {
            "id": "8918",
            "order_value": 1890,
            "payment_method": "Netbanking",
            "delivery_delay_days": 0,
            "number_of_items": 1,
            "is_multi_size_order": 0,
            "customer_order_count": 32,
            "customer_previous_return_count": 1,
            "customer_previous_cancel_count": 0,
            "customer_historical_return_rate": 0.031,
            "customer_avg_order_value": 2800,
            "order_value_deviation": -0.32,
            "product_category": "Apparel",
            "product_historical_return_rate": 0.062,
            "category_historical_return_rate": 0.22,
            "discount_percent": 0.0,
            "is_first_time_customer": 0
        },
        {
            "id": "8917",
            "order_value": 6490,
            "payment_method": "Credit Card",
            "delivery_delay_days": 0,
            "number_of_items": 1,
            "is_multi_size_order": 0,
            "customer_order_count": 5,
            "customer_previous_return_count": 2,
            "customer_previous_cancel_count": 0,
            "customer_historical_return_rate": 0.40,
            "customer_avg_order_value": 4100,
            "order_value_deviation": 0.58,
            "product_category": "Footwear",
            "product_historical_return_rate": 0.321,
            "category_historical_return_rate": 0.284,
            "discount_percent": 10.0,
            "is_first_time_customer": 0
        },
        {
            "id": "8916",
            "order_value": 11990,
            "payment_method": "UPI",
            "delivery_delay_days": 0,
            "number_of_items": 1,
            "is_multi_size_order": 0,
            "customer_order_count": 19,
            "customer_previous_return_count": 3,
            "customer_previous_cancel_count": 1,
            "customer_historical_return_rate": 0.157,
            "customer_avg_order_value": 8500,
            "order_value_deviation": 0.41,
            "product_category": "Furniture & Home",
            "product_historical_return_rate": 0.095,
            "category_historical_return_rate": 0.12,
            "discount_percent": 0.0,
            "is_first_time_customer": 0
        },
        {
            "id": "8915",
            "order_value": 3490,
            "payment_method": "COD",
            "delivery_delay_days": 1,
            "number_of_items": 1,
            "is_multi_size_order": 0,
            "customer_order_count": 11,
            "customer_previous_return_count": 4,
            "customer_previous_cancel_count": 2,
            "customer_historical_return_rate": 0.363,
            "customer_avg_order_value": 3900,
            "order_value_deviation": -0.10,
            "product_category": "Personal Care",
            "product_historical_return_rate": 0.21,
            "category_historical_return_rate": 0.15,
            "discount_percent": 15.0,
            "is_first_time_customer": 0
        }
    ]
    
    predictions = {}
    for o in prototype_orders:
        res = predictor.predict(o)
        predictions[o["id"]] = res
        print(f"Order #{o['id']}: Probability = {res['return_probability']*100:.1f}%, Risk Score = {res['risk_score']}, Tier = {res['risk_level']}")
        
    export_payload = {
        "metadata": metadata,
        "predictions": predictions
    }
    
    export_json_path = os.path.join(models_dir, 'frontend_model_payload.json')
    with open(export_json_path, 'w') as f:
        json.dump(export_payload, f, indent=2)
        
    print(f"\nFrontend synchronization payload exported to: {export_json_path}")
    return export_payload

if __name__ == "__main__":
    export_ml_artifacts_to_frontend()
