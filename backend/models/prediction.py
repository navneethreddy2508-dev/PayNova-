"""
ReturnPrediction model persisting model outputs, probability, score, tier, revenue-at-risk, and explanations.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class ReturnPrediction(Base):
    __tablename__ = "return_predictions"

    prediction_id = Column(String(64), primary_key=True, index=True)
    order_id = Column(String(64), ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=False, index=True)
    
    return_probability = Column(Float, nullable=False) # 0.0 to 1.0
    risk_score = Column(Integer, nullable=False)       # 0 to 100
    risk_level = Column(String(16), nullable=False)    # LOW, MEDIUM, HIGH
    revenue_at_risk = Column(Float, nullable=False)    # Order value * probability (INR)
    
    risk_factors = Column(JSON, default=list)          # List of explanation objects
    model_version = Column(String(64), default="order-return-risk-model-v1.0")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    order = relationship("Order", back_populates="predictions")

    @property
    def order_value_inr(self) -> float:
        return float(self.order.order_value) if self.order else 0.0

    @property
    def revenue_at_risk_inr(self) -> float:
        return float(self.revenue_at_risk) if self.revenue_at_risk is not None else 0.0

    @property
    def top_risk_factors(self) -> list:
        return self.risk_factors or []
