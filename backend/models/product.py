"""
Product model storing catalog metadata and category baseline return propensities.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String(64), primary_key=True, index=True) # e.g. "PROD-HEADPHONE-PRO"
    product_name = Column(String(256), nullable=False)
    sku = Column(String(64), unique=True, nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True)
    price = Column(Float, nullable=False) # In INR (₹)
    image_url = Column(String(512), nullable=True)
    
    # Historical Return Propensity Baselines
    historical_return_rate = Column(Float, default=0.15) # 0.0 to 1.0
    category_return_rate = Column(Float, default=0.18)   # 0.0 to 1.0
    common_return_reasons = Column(JSON, default=list)  # Top return categories
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    orders = relationship("Order", back_populates="product")
