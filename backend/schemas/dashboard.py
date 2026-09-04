"""
Pydantic schemas for dynamic Dashboard KPIs and analytics summaries.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CategorySummary(BaseModel):
    category: str
    order_volume: int
    return_rate: float
    revenue_at_risk: float
    top_reason: str

class MonthlyTrend(BaseModel):
    month: str
    total_orders: int
    return_rate: float
    rev_at_risk: float
    recovered: float

class DashboardKPIs(BaseModel):
    totalMonitoredOrders: int
    totalRevenueMonitored: float # INR
    predictedReturnsCount: int
    predictedReturnRate: str
    totalRevenueAtRisk: float    # INR
    actualRevenueRecovered: float # INR
    highRiskOrdersCount: int
    mediumRiskOrdersCount: int
    lowRiskOrdersCount: int
    avgReturnProbability: str

class DashboardSummaryResponse(BaseModel):
    kpis: DashboardKPIs
    category_breakdown: List[CategorySummary]
    monthly_trend: List[MonthlyTrend]
    recent_high_risk_orders: List[Dict[str, Any]]
    model_quick_stats: Dict[str, Any]
