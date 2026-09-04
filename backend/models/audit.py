"""
AuditEvent model providing an immutable chronological log of actions and model decisions.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON
from backend.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    event_id = Column(String(64), primary_key=True, index=True) # e.g. "AUD-991"
    order_id = Column(String(64), nullable=True, index=True)    # e.g. "8921"
    
    actor = Column(String(128), nullable=False)                 # "AI Inference Engine", "Jane Doe (Merchant Reviewer)"
    action_type = Column(String(64), nullable=False, index=True)# MODEL_EVAL, RISK_FLAG, MERCHANT_ACTION, SYSTEM_INGEST
    event_name = Column(String(256), nullable=False)            # Human-readable event title
    
    return_probability = Column(String(16), default="-")        # e.g. "41%", "-"
    model_version = Column(String(64), default="-")
    details = Column(String(1024), nullable=True)               # Narrative description
    badge_color = Column(String(32), default="slate")          # red, amber, emerald, blue, slate
    
    event_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
