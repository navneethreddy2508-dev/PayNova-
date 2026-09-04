"""
Audit service providing immutable audit logging.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.models.audit import AuditEvent

def log_audit_event(
    db: Session,
    actor: str,
    action_type: str,
    event_name: str,
    order_id: str = None,
    return_probability: str = "-",
    model_version: str = "ReturnGuard-Ensemble v1.0",
    details: str = None,
    badge_color: str = "slate",
    event_metadata: dict = None
) -> AuditEvent:
    """
    Creates and commits an immutable audit event.
    """
    event_id = f"AUD-{uuid.uuid4().hex[:6].upper()}"
    event = AuditEvent(
        event_id=event_id,
        order_id=order_id,
        actor=actor,
        action_type=action_type,
        event_name=event_name,
        return_probability=return_probability,
        model_version=model_version,
        details=details,
        badge_color=badge_color,
        event_metadata=event_metadata or {},
        created_at=datetime.now(timezone.utc)
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
