"""
Order model storing e-commerce orders and their ML feature attributes.
Strictly free of post-return leakage information.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.database import Base

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String(64), primary_key=True, index=True) # e.g. "8921" or "ORD-8921"
    order_code = Column(String(64), nullable=False, index=True) # e.g. "#ORD-8921"
    
    customer_id = Column(String(64), ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(64), ForeignKey("products.product_id", ondelete="SET NULL"), nullable=True, index=True)
    
    category = Column(String(64), nullable=False, index=True)
    order_value = Column(Float, nullable=False) # In INR (₹)
    currency = Column(String(8), default="INR")
    
    order_date = Column(String(32), nullable=False, index=True) # "2026-08-24"
    formatted_date = Column(String(64), nullable=True)          # "24 Aug 2026, 02:45 PM"
    
    payment_method = Column(String(64), nullable=False)        # UPI, Credit Card, COD, etc.
    delivery_type = Column(String(32), default="Standard")      # Standard, Express, Same Day
    delivery_status = Column(String(32), default="Processing")  # Processing, Shipped, Delivered
    delivery_date = Column(String(64), nullable=True)          # "Expected 28 Aug 2026"
    shipping_city = Column(String(64), nullable=True)
    
    # ML Features available at/before prediction time
    delivery_delay_days = Column(Integer, default=0)
    number_of_items = Column(Integer, default=1)
    is_multi_size_order = Column(Integer, default=0) # 1 if bracket purchase, else 0
    discount_percent = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    product = relationship("Product", back_populates="orders")
    predictions = relationship("ReturnPrediction", back_populates="order", cascade="all, delete-orphan", order_by="desc(ReturnPrediction.created_at)")
    interventions = relationship("ReturnIntervention", back_populates="order", cascade="all, delete-orphan", order_by="desc(ReturnIntervention.created_at)")

    __table_args__ = (
        Index("idx_orders_customer_date", "customer_id", "order_date"),
        Index("idx_orders_category_val", "category", "order_value"),
    )
