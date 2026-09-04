"""
Tests for Interventions & Merchant Review Workflow.
"""

def test_submit_intervention_action(client):
    payload = {
        "order_id": "8921",
        "action": "CUSTOMER_OUTREACH",
        "reviewer": "Jane Doe (Merchant Reviewer)",
        "note_text": "Initiated customer WhatsApp outreach to confirm sizing specifications."
    }
    response = client.post("/api/interventions", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["order_id"] == "8921"
    assert data["action"] == "CUSTOMER_OUTREACH"
    assert data["status"] == "Verification Requested"
    assert len(data["notes"]) > 0
    assert any("WhatsApp" in n["text"] for n in data["notes"])

    # Verify that an audit event was automatically logged
    audit_res = client.get("/api/audit-events?order_id=8921")
    assert audit_res.status_code == 200
    events = audit_res.json()
    assert any("CUSTOMER_OUTREACH" in e.get("event_name", "") or "Verification" in e.get("event_name", "") for e in events)

def test_get_intervention_by_order_id(client):
    response = client.get("/api/interventions/8921")
    assert response.status_code == 200
    data = response.json()
    assert data["order_id"] == "8921"
    assert "status" in data
    assert "reviewer" in data
