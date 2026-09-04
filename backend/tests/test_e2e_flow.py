"""
End-to-End Comprehensive Flow Tests for AI Order Return-Risk Scorer.
Tests the complete lifecycle:
Health -> Order Ingestion -> ML Scoring -> Revenue at Risk -> Detail Hydration ->
Customer Behavior -> Product Context -> Merchant Intervention -> Audit Trail ->
Model Diagnostics -> Threshold Settings.
"""

def test_api_health(client):
    """Verify health endpoint."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["currency"] == "INR"

def test_complete_return_risk_order_lifecycle_e2e(client):
    """
    Executes a complete real-world e-commerce order return-risk lifecycle:
    1. Create high-risk order (Apparel bracket buying on COD)
    2. Model evaluates return probability, score, revenue at risk (₹), and explanations
    3. Order is listed in Monitoring table and filtered
    4. Analyst inspects hydrated Order Details & Customer Behavioral Profile
    5. Analyst takes human intervention action (CUSTOMER_OUTREACH)
    6. System records state transition and creates immutable Audit Event
    7. Case is resolved with final merchant action (RESOLVED)
    8. Dashboard KPIs reflect the recovered revenue
    """
    # Step 1: Ingest High-Risk Order
    order_payload = {
        "order_id": "ORD-E2E-8999",
        "customer_id": "CUST-9921-DL", # High historical return rate customer (53.8%)
        "product_id": "PROD-DRESS-SUMMER", # High return apparel (38.0%)
        "category": "Apparel",
        "order_value": 8500.0,
        "payment_method": "Cash on Delivery (COD)",
        "delivery_type": "Standard",
        "delivery_status": "Processing",
        "shipping_city": "New Delhi",
        "delivery_delay_days": 1,
        "number_of_items": 2,
        "is_multi_size_order": 1, # Multi-size bracket purchase
        "discount_percent": 15.0
    }
    create_res = client.post("/api/orders", json=order_payload)
    assert create_res.status_code == 201
    order_data = create_res.json()
    assert order_data["id"] == "ORD-E2E-8999"
    assert order_data["value"] == 8500.0

    # Step 2: Verify Prediction, Risk Score & Revenue at Risk calculation
    pred = order_data["latest_prediction"]
    assert pred is not None
    prob = pred["return_probability"]
    score = pred["risk_score"]
    rev_at_risk = pred["revenue_at_risk_inr"]

    # Verify mathematical accuracy: Revenue at Risk = Order Value * Return Probability
    expected_rev_at_risk = round(8500.0 * prob, 2)
    assert abs(rev_at_risk - expected_rev_at_risk) <= 0.05
    assert score >= 40 # Moderate to high probability
    assert len(pred["top_risk_factors"]) > 0

    # Step 3: Verify Order Monitoring search & category filter
    search_res = client.get("/api/orders?search=8999")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total"] == 1
    assert search_data["items"][0]["id"] == "ORD-E2E-8999"

    cat_res = client.get("/api/orders?category=Apparel")
    assert cat_res.status_code == 200
    assert any(i["id"] == "ORD-E2E-8999" for i in cat_res.json()["items"])

    # Step 4: Hydrate Order Detail & Customer Profile
    detail_res = client.get("/api/orders/ORD-E2E-8999")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["customer"]["customer_id"] == "CUST-9921-DL"
    assert detail["customer"]["historical_return_rate"] == 0.538
    assert detail["product"]["sku"] == "APP-DRS-112"
    assert len(detail["factors"]) > 0

    # Step 5: Execute Human Merchant Intervention Action: CUSTOMER_OUTREACH
    outreach_payload = {
        "order_id": "ORD-E2E-8999",
        "action": "CUSTOMER_OUTREACH",
        "reviewer": "Jane Doe (Senior Analyst)",
        "note_text": "Initiated WhatsApp size confirmation with customer before warehouse dispatch.",
        "priority": "High"
    }
    outreach_res = client.post("/api/interventions", json=outreach_payload)
    assert outreach_res.status_code == 200
    outreach_data = outreach_res.json()
    assert outreach_data["action"] == "CUSTOMER_OUTREACH"
    assert outreach_data["status"] == "Verification Requested"
    assert len(outreach_data["notes"]) == 1

    # Step 6: Verify Immutable Audit Trail records the intervention
    audit_res = client.get("/api/audit-events?order_id=ORD-E2E-8999")
    assert audit_res.status_code == 200
    audit_events = audit_res.json()
    assert len(audit_events) >= 2 # Model Eval + Merchant Action
    assert any(e["action_type"] == "MERCHANT_ACTION" for e in audit_events)

    # Step 7: Resolve Case after Customer Confirmation (RESOLVED)
    resolve_payload = {
        "order_id": "ORD-E2E-8999",
        "action": "RESOLVED",
        "reviewer": "Jane Doe (Senior Analyst)",
        "note_text": "Customer confirmed size M; cancel duplicate size L. Order verified and released for dispatch."
    }
    resolve_res = client.post("/api/interventions", json=resolve_payload)
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "Resolved"

    # Step 8: Verify Dashboard Reflects Updates
    dash_res = client.get("/api/dashboard/summary")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["kpis"]["totalMonitoredOrders"] >= 8
    assert dash_data["kpis"]["totalRevenueMonitored"] > 0
    assert dash_data["kpis"]["actualRevenueRecovered"] > 0

def test_order_simulator_to_analyst_flow_e2e(client):
    """
    Tests the complete Interface 1 (Order Simulator) -> AI Inference -> Database -> Interface 2 (Risk Analyst) flow:
    1. Order Simulator creates new order with custom/preset customer
    2. Backend auto-provisions and executes Random Forest scoring
    3. Real Return Probability and Revenue at Risk generated
    4. Order is saved in SQLite and appears in Order Monitoring
    5. Analyst inspects details, factors, and audit trail
    """
    simulated_payload = {
        "order_id": "ORD-SIM-101",
        "customer_id": "CUST-SIM-RAJ",
        "customer_name": "Rajesh Malhotra",
        "product_id": "PROD-SONY-XM5",
        "product_name": "Sony WH-1000XM5 Wireless Headphones",
        "category": "Electronics",
        "order_value": 12490.0,
        "currency": "INR",
        "payment_method": "Razorpay UPI",
        "delivery_type": "Express",
        "shipping_city": "Bengaluru",
        "delivery_delay_days": 0,
        "number_of_items": 1,
        "is_multi_size_order": 0,
        "discount_percent": 5.0,
        "customer_return_rate": 0.05,
        "customer_total_orders": 20,
        "customer_previous_returns": 1
    }

    # 1. Simulator submits order
    res = client.post("/api/orders", json=simulated_payload)
    assert res.status_code == 201
    order_data = res.json()
    assert order_data["id"] == "ORD-SIM-101"
    assert order_data["customer"]["customer_name"] == "Rajesh Malhotra"
    assert order_data["value"] == 12490.0

    # 2. Verify ML Model scored it
    assert order_data["latest_prediction"] is not None
    assert 0 <= order_data["return_probability"] <= 100
    assert order_data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert order_data["revenue_at_risk"] >= 0

    # 3. Verify it is queryable in Order Monitoring
    orders_res = client.get("/api/orders?search=SIM-101")
    assert orders_res.status_code == 200
    matching = orders_res.json()["items"]
    assert len(matching) == 1
    assert matching[0]["id"] == "ORD-SIM-101"

    # 4. Verify Analyst Order Detail page hydration
    detail_res = client.get("/api/orders/ORD-SIM-101")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["customer"]["customer_id"] == "CUST-SIM-RAJ"
    assert len(detail["factors"]) > 0

    # 5. Verify Audit Trail event
    audit_res = client.get("/api/audit-events?order_id=ORD-SIM-101")
    assert audit_res.status_code == 200
    events = audit_res.json()
    assert len(events) >= 1
    assert events[0]["order_id"] == "ORD-SIM-101"

