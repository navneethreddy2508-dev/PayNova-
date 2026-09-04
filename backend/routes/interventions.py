"""
Interventions and Merchant Review Actions API router.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.intervention import ReturnIntervention
from backend.schemas.intervention import InterventionActionRequest, InterventionResponse
from backend.services.intervention_service import create_or_update_intervention

router = APIRouter(prefix="/interventions", tags=["Return Interventions"])

@router.post("", response_model=InterventionResponse, status_code=status.HTTP_200_OK)
def submit_intervention_action(request: InterventionActionRequest, db: Session = Depends(get_db)):
    """
    Submit a merchant review decision (MONITOR, CUSTOMER_OUTREACH, REVIEW, PREVENTIVE_ACTION, RESOLVED)
    for a high/medium return-risk order.
    Automatically updates case status and logs an immutable audit event.
    """
    return create_or_update_intervention(
        db=db,
        order_id=request.order_id,
        action=request.action,
        reviewer=request.reviewer,
        note_text=request.note_text,
        priority=request.priority,
        status=request.status
    )

@router.get("/{order_id}", response_model=InterventionResponse)
def get_order_intervention(order_id: str, db: Session = Depends(get_db)):
    """Get active return-risk review case for an order."""
    case = db.query(ReturnIntervention).filter(ReturnIntervention.order_id == order_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"No active review case found for order '{order_id}'.")
    return case
