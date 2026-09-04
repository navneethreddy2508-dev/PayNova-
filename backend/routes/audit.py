"""
Audit Events API router.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database import get_db
from backend.models.audit import AuditEvent
from backend.schemas.audit import AuditEventResponse

router = APIRouter(prefix="/audit-events", tags=["Audit Events"])

@router.get("", response_model=List[AuditEventResponse])
def get_audit_trail(
    order_id: Optional[str] = Query(None, description="Filter audit events by Order ID"),
    action_type: Optional[str] = Query(None, description="Filter by action type (MODEL_EVAL, RISK_FLAG, MERCHANT_ACTION, etc.)"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Get immutable audit trail log of model evaluations, risk flags, and merchant review decisions.
    """
    query = db.query(AuditEvent)
    if order_id:
        query = query.filter(AuditEvent.order_id == order_id)
    if action_type:
        query = query.filter(AuditEvent.action_type == action_type)
        
    return query.order_by(desc(AuditEvent.created_at)).limit(limit).all()
