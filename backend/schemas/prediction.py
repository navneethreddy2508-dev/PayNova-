"""
Pydantic schemas for Return-Risk Predictions & Feature Explanations.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class RiskFactor(BaseModel):
    name: str
    impact: str     # e.g. "+45%", "-32%"
    weight: float   # e.g. 0.45
    type: str = "general" # behavior, customer, product, value, payment, delivery
    importance_rank: int = 1

    model_config = ConfigDict(from_attributes=True)

class ReturnRiskPredictRequest(BaseModel):
    order_id: Optional[str] = None
    customer_id: Optional[str] = None
    product_id: Optional[str] = None
    product_category: Optional[str] = "Apparel"
    order_value: float = Field(..., gt=0, description="Monetary value of order in INR")
    payment_method: str = "UPI"
    delivery_type: str = "Standard"
    delivery_delay_days: int = 0
    number_of_items: int = 1
    is_multi_size_order: int = 0
    discount_percent: float = 0.0
    is_first_time_customer: int = 0
    
    # Optional customer overrides if not in DB
    customer_order_count: Optional[int] = None
    customer_previous_return_count: Optional[int] = None
    customer_previous_cancel_count: Optional[int] = None
    customer_historical_return_rate: Optional[float] = None
    customer_avg_order_value: Optional[float] = None
    order_value_deviation: Optional[float] = None
    product_historical_return_rate: Optional[float] = None
    category_historical_return_rate: Optional[float] = None

class ReturnRiskPredictResponse(BaseModel):
    order_id: str
    return_probability: float
    risk_score: int
    risk_level: str # LOW, MEDIUM, HIGH
    order_value_inr: float = 0.0
    revenue_at_risk_inr: float = 0.0
    top_risk_factors: List[RiskFactor] = []
    model_version: str = "order-return-risk-model-v1.0"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
