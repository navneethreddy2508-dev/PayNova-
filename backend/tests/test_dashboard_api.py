"""
Tests for Dashboard API (KPIs, Charts, Category Breakdown).
"""

def test_get_dashboard_summary(client):
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    
    # Check KPIs
    assert "kpis" in data
    kpis = data["kpis"]
    assert kpis["totalMonitoredOrders"] >= 7
    assert kpis["totalRevenueMonitored"] > 0
    assert kpis["totalRevenueAtRisk"] > 0
    assert (kpis["highRiskOrdersCount"] + kpis["mediumRiskOrdersCount"] + kpis["lowRiskOrdersCount"]) == kpis["totalMonitoredOrders"]

    # Check Category Breakdown
    assert "category_breakdown" in data
    assert len(data["category_breakdown"]) > 0
    cat_names = [c["category"] for c in data["category_breakdown"]]
    assert "Apparel" in cat_names or "Electronics" in cat_names

    # Check Monthly Trend
    assert "monthly_trend" in data
    assert len(data["monthly_trend"]) == 6

    # Check Model Quick Stats
    assert "model_quick_stats" in data
    assert "accuracy" in data["model_quick_stats"]
