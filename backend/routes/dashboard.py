"""
Dashboard API router for aggregated business KPIs and charts.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.dashboard import DashboardSummaryResponse
from backend.services.dashboard_service import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_kpis_and_charts(db: Session = Depends(get_db)):
    """
    Get dynamic, database-computed summary metrics, KPIs, category breakdown,
    monthly trends, and high-risk orders feed for the executive dashboard.
    """
    return get_dashboard_summary(db=db)
