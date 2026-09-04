"""
Customer model storing non-PII behavioral attributes and historical return stats.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from backend.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(64), primary_key=True, index=True) # e.g. "CUST-8492-AX"
    customer_name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=False, index=True)
    location = Column(String(128), nullable=True)
    avatar_url = Column(String(256), nullable=True)
    
    # Behavioral and Historical Metrics
    total_orders = Column(Integer, default=1)
    previous_returns = Column(Integer, default=0)
    previous_cancellations = Column(Integer, default=0)
    historical_return_rate = Column(Float, default=0.15) # 0.0 to 1.0
    average_order_value = Column(Float, default=0.0)     # In INR (₹)
    
    customer_segment = Column(String(64), default="Standard Customer")
    notes = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
