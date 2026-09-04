"""
ReturnIntervention model storing merchant review decisions and workflow states.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class ReturnIntervention(Base):
    __tablename__ = "return_interventions"

    intervention_id = Column(String(64), primary_key=True, index=True)
    order_id = Column(String(64), ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(String(64), index=True) # e.g. "RR-1021"
    
    action = Column(String(64), nullable=False) # MONITOR, CUSTOMER_OUTREACH, REVIEW, PREVENTIVE_ACTION, RESOLVED
    priority = Column(String(32), default="Medium") # Low, Medium, High
    status = Column(String(32), default="Open")     # Open, Under Review, Monitored, Resolved
    reviewer = Column(String(128), default="Risk Operations Analyst")
    
    risk_summary = Column(String(512), nullable=True)
    notes = Column(JSON, default=list) # List of note objects {author, date, text}
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    order = relationship("Order", back_populates="interventions")
