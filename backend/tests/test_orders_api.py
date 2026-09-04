"""
Tests for Orders API (Listing, Filtering, Details, Creation).
"""

def test_list_orders_unfiltered(client):
    response = client.get("/api/orders")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 7
    assert len(data["items"]) >= 7

def test_list_orders_search_filter(client):
    response = client.get("/api/orders?search=8921")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == "8921"

def test_list_orders_category_filter(client):
    response = client.get("/api/orders?category=Electronics")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["category"] == "Electronics"

def test_list_orders_risk_level_filter(client):
    response = client.get("/api/orders?risk_level=LOW")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["risk_level"] == "LOW"

def test_get_order_detail_success(client):
    response = client.get("/api/orders/8921")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "8921"
    assert data["code"] == "#ORD-8921"
    assert data["customer"]["customer_id"] == "CUST-8492-AX"
    assert data["value"] == 12490.0
    assert "factors" in data
    assert "return_probability" in data
    assert "revenue_at_risk" in data

def test_get_order_detail_not_found(client):
    response = client.get("/api/orders/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_create_order_success(client):
    payload = {
        "order_id": "ORD-TEST-NEW-01",
        "customer_id": "CUST-8492-AX",
        "product_id": "PROD-HEADPHONE-PRO",
        "category": "Electronics",
        "order_value": 14990.0,
        "payment_method": "Razorpay UPI",
        "delivery_type": "Express",
        "delivery_status": "Processing",
        "shipping_city": "Bengaluru",
        "delivery_delay_days": 0,
        "number_of_items": 1,
        "is_multi_size_order": 0,
        "discount_percent": 0.0
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == "ORD-TEST-NEW-01"
    assert data["value"] == 14990.0
    assert data["latest_prediction"] is not None
    assert data["return_probability"] > 0

def test_upload_evidence_success(client):
    """
    Test attaching real evidence (PDF/image) to an existing order.
    """
    file_content = b"%PDF-1.4 Mock Courier Proof of Delivery Document Bytes"
    files = {
        "file": ("courier_pod_signed.pdf", file_content, "application/pdf")
    }
    data = {
        "title": "Signed Courier POD",
        "evidence_type": "delivery",
        "notes": "Customer signature verified on logistics airway bill."
    }
    response = client.post("/api/orders/8921/evidence", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert res_data["evidence"]["title"] == "Signed Courier POD"
    assert res_data["evidence"]["file"] == "courier_pod_signed.pdf"
    assert res_data["evidence"]["size"] == len(file_content)

    # Verify that order detail now includes the new evidence
    detail_res = client.get("/api/orders/8921")
    assert detail_res.status_code == 200
    evidence_list = detail_res.json()["evidence"]
    assert any(e["file"] == "courier_pod_signed.pdf" for e in evidence_list)

def test_upload_evidence_unsupported_format(client):
    """
    Test uploading unsupported file extension fails with 400.
    """
    files = {
        "file": ("malicious_script.exe", b"invalid binary", "application/octet-stream")
    }
    data = {
        "title": "Invalid File Test",
        "evidence_type": "other"
    }
    response = client.post("/api/orders/8921/evidence", files=files, data=data)
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]

def test_upload_evidence_order_not_found(client):
    """
    Test uploading evidence to non-existent order fails with 404.
    """
    files = {
        "file": ("proof.jpg", b"fake jpeg image data", "image/jpeg")
    }
    data = {
        "title": "Missing Order Test",
        "evidence_type": "receipt"
    }
    response = client.post("/api/orders/NON_EXISTENT_9999/evidence", files=files, data=data)
    assert response.status_code == 404

