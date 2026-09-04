"""
Customers API router for behavioral profiles and return history.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.customer import CustomerResponse
from backend.services.customer_service import get_customer_by_id

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    """
    Get customer safe behavioral information, lifetime orders, past returns,
    and historical return rate to support Order Details & Customer Profile views.
    """
    return get_customer_by_id(db=db, customer_id=customer_id)
