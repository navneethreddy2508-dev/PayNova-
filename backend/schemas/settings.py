"""
Pydantic schemas for Return Settings & Risk Thresholds.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class SettingsUpdateRequest(BaseModel):
    high_risk_threshold: Optional[int] = Field(None, ge=1, le=100)
    medium_risk_threshold: Optional[int] = Field(None, ge=1, le=100)
    low_risk_threshold: Optional[int] = Field(None, ge=1, le=100)
    auto_flag_threshold: Optional[int] = Field(None, ge=1, le=100)
    enable_realtime_inference: Optional[bool] = None
    notify_email: Optional[bool] = None
    notify_slack: Optional[bool] = None
    active_engine: Optional[str] = None
    currency_symbol: Optional[str] = None
    locale: Optional[str] = None

class SettingsResponse(BaseModel):
    highRiskThreshold: int
    mediumRiskThreshold: int
    lowRiskThreshold: int
    autoFlagOrdersAbove: int
    enableRealtimeInference: bool
    notifyHighRiskEmail: bool
    notifySlackWebhook: bool
    activeEngine: str
    currencySymbol: str
    currencyCode: str
    locale: str
    updatedAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
