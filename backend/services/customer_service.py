"""
Customer service providing customer behavioral lookups and safe profile queries.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.models.customer import Customer
from backend.schemas.customer import CustomerResponse

def get_customer_by_id(db: Session, customer_id: str) -> CustomerResponse:
    """
    Retrieves safe behavioral customer stats for Order Detail / Customer UI.
    """
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found.")
    return customer
