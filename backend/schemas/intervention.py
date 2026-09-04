"""
Pydantic schemas for Return Intervention & Merchant Review workflow.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class NoteItem(BaseModel):
    author: str
    date: str
    text: str

    model_config = ConfigDict(from_attributes=True)

class InterventionActionRequest(BaseModel):
    order_id: str
    action: str = Field(..., description="MONITOR, CUSTOMER_OUTREACH, REVIEW, PREVENTIVE_ACTION, RESOLVED")
    reviewer: str = "Merchant Reviewer"
    note_text: Optional[str] = None
    priority: Optional[str] = None # Low, Medium, High
    status: Optional[str] = None   # Open, Under Review, Escalated, Resolved

class InterventionResponse(BaseModel):
    intervention_id: str
    order_id: str
    case_id: Optional[str] = None
    action: str
    priority: str
    status: str
    reviewer: str
    risk_summary: Optional[str] = None
    notes: List[NoteItem] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
