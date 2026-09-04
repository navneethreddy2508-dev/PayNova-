"""
Product service providing product information and category return analytics.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.models.product import Product
from backend.models.order import Order
from backend.schemas.product import ProductResponse

def get_product_by_id(db: Session, product_id: str) -> ProductResponse:
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return product

def get_all_products(db: Session) -> List[ProductResponse]:
    return db.query(Product).all()

def get_category_analytics(db: Session) -> List[Dict[str, Any]]:
    """
    Computes category-level return analytics from database.
    """
    products = db.query(Product).all()
    categories: Dict[str, Dict[str, Any]] = {}
    
    for p in products:
        cat = p.category
        if cat not in categories:
            categories[cat] = {
                "category": cat,
                "categoryReturnRate": round(p.category_return_rate * 100, 1),
                "productsCount": 0,
                "avgPrice": 0.0,
                "commonReasons": list(p.common_return_reasons or [])
            }
        categories[cat]["productsCount"] += 1
        categories[cat]["avgPrice"] += p.price

    results = []
    for cat, data in categories.items():
        if data["productsCount"] > 0:
            data["avgPrice"] = round(data["avgPrice"] / data["productsCount"], 2)
        results.append(data)
        
    return results
