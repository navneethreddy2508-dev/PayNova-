"""
Products and Return Analytics API router.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.product import ProductResponse
from backend.services.product_service import get_product_by_id, get_all_products, get_category_analytics

router = APIRouter(tags=["Products & Analytics"])

@router.get("/products", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    """List all catalog products."""
    return get_all_products(db=db)

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get single product catalog information and historical baseline return rates."""
    return get_product_by_id(db=db, product_id=product_id)

@router.get("/analytics/categories", response_model=List[Dict[str, Any]])
def get_categories_analytics(db: Session = Depends(get_db)):
    """Get category-wise return rate breakdown and common return reasons."""
    return get_category_analytics(db=db)
