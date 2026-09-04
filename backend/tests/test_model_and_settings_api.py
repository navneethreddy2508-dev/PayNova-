"""
Tests for Model Performance, Settings, and Audit Trail API.
"""

def test_get_model_performance(client):
    response = client.get("/api/model")
    assert response.status_code == 200
    data = response.json()
    assert data["modelName"] == "ReturnGuard-Ensemble"
    assert data["accuracy"] == "81.2%"
    assert data["f1Score"] == "43.6%"
    assert data["rocAuc"] == "0.7541"
    assert "confusionMatrix" in data
    assert data["confusionMatrix"]["truePositive"] > 0
    assert len(data["featureImportance"]) > 0

def test_get_and_update_settings(client):
    # 1. Get current settings
    get_res = client.get("/api/settings")
    assert get_res.status_code == 200
    curr_settings = get_res.json()
    assert curr_settings["currencySymbol"] == "₹"
    assert curr_settings["currencyCode"] == "INR"

    # 2. Update thresholds
    update_payload = {
        "high_risk_threshold": 75,
        "medium_risk_threshold": 45
    }
    put_res = client.put("/api/settings", json=update_payload)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["highRiskThreshold"] == 75
    assert updated["mediumRiskThreshold"] == 45

    # 3. Check audit log recorded the update
    audit_res = client.get("/api/audit-events?action_type=SETTINGS_UPDATE")
    assert audit_res.status_code == 200
    events = audit_res.json()
    assert len(events) > 0
    assert any("75%" in e.get("details", "") for e in events)

    # 4. Restore defaults
    client.put("/api/settings", json={"high_risk_threshold": 70, "medium_risk_threshold": 40})

def test_get_audit_events_list(client):
    response = client.get("/api/audit-events?limit=20")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "event_name" in data[0]
    assert "action_type" in data[0]
