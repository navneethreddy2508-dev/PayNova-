"""
Pydantic schemas for Order entities and detail responses.
"""

from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.schemas.customer import CustomerResponse
from backend.schemas.product import ProductResponse
from backend.schemas.prediction import ReturnRiskPredictResponse, RiskFactor
from backend.schemas.intervention import InterventionResponse

class OrderCreate(BaseModel):
    order_id: Optional[str] = None
    customer_id: str
    customer_name: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category: str
    order_value: float = Field(..., gt=0, description="Order value in INR")
    currency: str = "INR"
    order_date: Optional[str] = None
    payment_method: str = "UPI"
    delivery_type: str = "Standard"
    delivery_status: str = "Processing"
    delivery_date: Optional[str] = None
    shipping_city: Optional[str] = None
    delivery_delay_days: int = 0
    number_of_items: int = 1
    is_multi_size_order: int = 0
    discount_percent: float = 0.0
    customer_return_rate: Optional[float] = None
    customer_total_orders: Optional[int] = None
    customer_previous_returns: Optional[int] = None

class OrderListItem(BaseModel):
    id: str
    code: str
    customer_name: str
    customer_avatar: Optional[str] = None
    category: str
    product_name: str
    value: float # INR
    date: str
    formatted_date: Optional[str] = None
    payment_method: str
    delivery_status: str
    return_probability: int # 0-100%
    risk_level: str         # LOW, MEDIUM, HIGH
    revenue_at_risk: float  # INR
    case_id: Optional[str] = None
    status: str             # Action Required, Monitored, Under Review, Resolved

    model_config = ConfigDict(from_attributes=True)

class OrderListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[OrderListItem]

class OrderDetailResponse(BaseModel):
    id: str
    code: str
    customer: CustomerResponse
    product: Optional[ProductResponse] = None
    value: float # INR
    date: str
    formatted_date: Optional[str] = None
    payment_method: str
    delivery_status: str
    delivery_date: Optional[str] = None
    shipping_city: Optional[str] = None
    return_probability: int
    risk_level: str
    revenue_at_risk: float
    case_id: Optional[str] = None
    status: str
    factors: List[RiskFactor] = []
    evidence: List[dict] = []
    latest_prediction: Optional[ReturnRiskPredictResponse] = None
    latest_intervention: Optional[InterventionResponse] = None

    model_config = ConfigDict(from_attributes=True)
