"""
ReturnSettings model storing centralized risk score thresholds and system configuration.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from backend.database import Base

class ReturnSettings(Base):
    __tablename__ = "return_settings"

    setting_id = Column(String(64), primary_key=True, default="default")
    
    # Thresholds (0-100)
    low_risk_threshold = Column(Integer, default=39)
    medium_risk_threshold = Column(Integer, default=40)
    high_risk_threshold = Column(Integer, default=70)
    auto_flag_threshold = Column(Integer, default=80)
    
    # Notification & Inference options
    enable_realtime_inference = Column(Boolean, default=True)
    notify_email = Column(Boolean, default=True)
    notify_slack = Column(Boolean, default=False)
    
    active_engine = Column(String(128), default="ReturnGuard-Ensemble (Random Forest)")
    currency_symbol = Column(String(8), default="₹")
    currency_code = Column(String(8), default="INR")
    locale = Column(String(16), default="en-IN")
    
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
