"""
Intervention service managing human merchant review actions and state transitions.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.models.intervention import ReturnIntervention
from backend.models.order import Order
from backend.services.audit_service import log_audit_event

ACTION_STATUS_MAP = {
    "MONITOR": "Monitored",
    "CUSTOMER_OUTREACH": "Verification Requested",
    "REVIEW": "Under Review",
    "PREVENTIVE_ACTION": "Flagged for Senior Review",
    "RESOLVED": "Resolved"
}

ACTION_TITLE_MAP = {
    "MONITOR": "Merchant Review: Order Monitored",
    "CUSTOMER_OUTREACH": "Customer Outreach: Verification Initiated",
    "REVIEW": "Merchant Review: Case Under Investigation",
    "PREVENTIVE_ACTION": "Merchant Action: Preventive Review Applied",
    "RESOLVED": "Merchant Action: Review Case Resolved"
}

ACTION_BADGE_MAP = {
    "MONITOR": "slate",
    "CUSTOMER_OUTREACH": "blue",
    "REVIEW": "amber",
    "PREVENTIVE_ACTION": "red",
    "RESOLVED": "emerald"
}

def create_or_update_intervention(
    db: Session,
    order_id: str,
    action: str,
    reviewer: str = "Jane Doe (Merchant Reviewer)",
    note_text: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None
) -> ReturnIntervention:
    """
    Executes a merchant review action on an order:
    1. Validates the order exists
    2. Updates or creates the ReturnIntervention case
    3. Appends the reviewer note
    4. Automatically writes a detailed audit event
    """
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found.")

    action_norm = action.upper().strip()
    new_status = status or ACTION_STATUS_MAP.get(action_norm, "Under Review")
    
    intervention = db.query(ReturnIntervention).filter(ReturnIntervention.order_id == order_id).first()
    
    now_dt = datetime.now(timezone.utc)
    now_str = now_dt.strftime("%d %b %Y, %I:%M %p")
    note_entry = None
    if note_text:
        note_entry = {
            "author": reviewer,
            "date": now_str,
            "text": note_text
        }
        
    if not intervention:
        case_id = f"RR-{1000 + (hash(order_id) % 9000)}"
        intervention = ReturnIntervention(
            intervention_id=f"INT-{uuid.uuid4().hex[:8].upper()}",
            order_id=order_id,
            case_id=case_id,
            action=action_norm,
            priority=priority or "Medium",
            status=new_status,
            reviewer=reviewer,
            risk_summary=f"Merchant review initiated for order #{order_id}.",
            notes=[note_entry] if note_entry else [],
            created_at=now_dt,
            updated_at=now_dt
        )
        db.add(intervention)
    else:
        intervention.action = action_norm
        intervention.status = new_status
        if priority:
            intervention.priority = priority
        intervention.reviewer = reviewer
        intervention.updated_at = now_dt
        
        if note_entry:
            existing_notes = list(intervention.notes or [])
            existing_notes.append(note_entry)
            intervention.notes = existing_notes

    db.commit()
    db.refresh(intervention)

    # Log Immutable Audit Trail Event
    event_title = ACTION_TITLE_MAP.get(action_norm, f"Merchant Action: {action_norm}")
    badge = ACTION_BADGE_MAP.get(action_norm, "blue")
    
    latest_pred = order.predictions[0] if order.predictions else None
    prob_str = f"{latest_pred.risk_score}%" if latest_pred else "-"

    log_audit_event(
        db=db,
        actor=reviewer,
        action_type="MERCHANT_ACTION",
        event_name=event_title,
        order_id=order_id,
        return_probability=prob_str,
        model_version=latest_pred.model_version if latest_pred else "ReturnGuard-Ensemble v1.0",
        details=note_text or f"Merchant updated case {intervention.case_id} to '{new_status}'.",
        badge_color=badge,
        event_metadata={"action": action_norm, "status": new_status, "case_id": intervention.case_id}
    )

    return intervention
