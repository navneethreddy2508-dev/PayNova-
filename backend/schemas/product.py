"""
Pydantic schemas for Product entity.
"""

from typing import Optional, List
import json
from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator

class ProductBase(BaseModel):
    product_id: str
    product_name: str
    sku: str
    category: str
    price: float # INR
    image_url: Optional[str] = None
    historical_return_rate: float = 0.15 # 0.0 to 1.0
    category_return_rate: float = 0.18   # 0.0 to 1.0
    common_return_reasons: List[str] = []

    @field_validator("common_return_reasons", mode="before")
    @classmethod
    def parse_reasons(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return [v] if v else []
        return v or []

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
