"""
Pydantic schemas for Audit Event logs.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AuditEventCreate(BaseModel):
    order_id: Optional[str] = None
    actor: str
    action_type: str # MODEL_EVAL, RISK_FLAG, MERCHANT_ACTION, SYSTEM_INGEST, SETTINGS_UPDATE
    event_name: str
    return_probability: str = "-"
    model_version: str = "-"
    details: Optional[str] = None
    badge_color: str = "slate"
    event_metadata: Dict[str, Any] = {}

class AuditEventResponse(BaseModel):
    event_id: str
    order_id: Optional[str] = None
    actor: str
    action_type: str
    event_name: str
    return_probability: str
    model_version: str
    details: Optional[str] = None
    badge_color: str
    event_metadata: Dict[str, Any] = {}
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
