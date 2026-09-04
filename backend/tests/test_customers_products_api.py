"""
Tests for Customers, Products, and Analytics API.
"""

def test_get_customer_success(client):
    response = client.get("/api/customers/CUST-8492-AX")
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "CUST-8492-AX"
    assert data["customer_name"] == "Priya Sharma"
    assert data["total_orders"] == 14
    assert data["historical_return_rate"] == 0.428

def test_get_customer_not_found(client):
    response = client.get("/api/customers/CUST-NONEXISTENT")
    assert response.status_code == 404

def test_list_products(client):
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 7

def test_get_product_detail(client):
    response = client.get("/api/products/PROD-HEADPHONE-PRO")
    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == "PROD-HEADPHONE-PRO"
    assert data["category"] == "Electronics"
    assert data["price"] == 12490.0

def test_get_category_analytics(client):
    response = client.get("/api/analytics/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    cat_names = [c["category"] for c in data]
    assert "Apparel" in cat_names
