"""
Tests for Return-Risk Prediction API & ML Engine.
"""

def test_predict_return_risk_high_risk_order(client):
    """
    Test prediction for an order with high return propensity
    (Bracket purchasing multi-size + high customer return rate).
    """
    payload = {
        "order_id": "ORD-TEST-HIGH-01",
        "customer_id": "CUST-9921-DL",
        "product_category": "Apparel",
        "order_value": 7490.0,
        "payment_method": "COD",
        "delivery_type": "Standard",
        "delivery_delay_days": 2,
        "number_of_items": 2,
        "is_multi_size_order": 1,
        "customer_historical_return_rate": 0.538,
        "customer_order_count": 26,
        "customer_previous_return_count": 14,
        "customer_avg_order_value": 3200.0,
        "product_historical_return_rate": 0.38,
        "category_historical_return_rate": 0.315,
        "discount_percent": 20.0
    }
    
    response = client.post("/api/return-risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["order_id"] == "ORD-TEST-HIGH-01"
    assert 0.0 <= data["return_probability"] <= 1.0
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert data["revenue_at_risk_inr"] > 0
    assert len(data["top_risk_factors"]) > 0
    assert "model_version" in data

    # Verify bracket purchasing factor was captured
    factor_names = [f["name"] for f in data["top_risk_factors"]]
    assert any("Bracket" in name or "return" in name.lower() for name in factor_names)

def test_predict_return_risk_low_risk_order(client):
    """
    Test prediction for a low-risk order (VIP customer, staple SKU, low return rate).
    """
    payload = {
        "order_id": "ORD-TEST-LOW-01",
        "customer_id": "CUST-1049-HY",
        "product_category": "Apparel",
        "order_value": 1890.0,
        "payment_method": "UPI",
        "delivery_type": "Express",
        "delivery_delay_days": 0,
        "number_of_items": 1,
        "is_multi_size_order": 0,
        "customer_historical_return_rate": 0.031,
        "customer_order_count": 32,
        "customer_previous_return_count": 1,
        "customer_avg_order_value": 2800.0,
        "product_historical_return_rate": 0.06,
        "category_historical_return_rate": 0.22,
        "discount_percent": 0.0
    }
    
    response = client.post("/api/return-risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["risk_level"] == "LOW"
    assert data["risk_score"] < 40
    assert data["revenue_at_risk_inr"] < 1000.0

def test_predict_return_risk_invalid_input(client):
    """
    Test validation failure when order_value <= 0.
    """
    payload = {
        "order_value": -500.0,
        "product_category": "Apparel"
    }
    response = client.post("/api/return-risk/predict", json=payload)
    assert response.status_code == 422 # Pydantic validation error
