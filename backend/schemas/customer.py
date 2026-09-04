"""
Pydantic schemas for Customer entity.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class CustomerBase(BaseModel):
    customer_id: str
    customer_name: str
    email: str
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    total_orders: int = 1
    previous_returns: int = 0
    previous_cancellations: int = 0
    historical_return_rate: float = 0.15 # 0.0 to 1.0
    average_order_value: float = 0.0     # INR
    customer_segment: str = "Standard Customer"
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
