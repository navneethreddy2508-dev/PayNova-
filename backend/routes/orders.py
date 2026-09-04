"""
Orders API router for querying, filtering, detail retrieval, and order creation.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status, File, UploadFile, Form, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.order import OrderCreate, OrderListResponse, OrderDetailResponse
from backend.schemas.prediction import ReturnRiskPredictResponse
from backend.services.order_service import (
    get_orders,
    get_order_by_id,
    create_order,
    upload_order_evidence
)
from backend.services.prediction_service import predict_return_risk_for_order

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=OrderListResponse)
def list_orders(
    search: Optional[str] = Query(None, description="Search by Order ID, Customer Name, Category, or SKU"),
    category: Optional[str] = Query(None, description="Filter by category (Apparel, Footwear, Electronics, etc.)"),
    risk_level: Optional[str] = Query(None, description="Filter by risk tier (HIGH, MEDIUM, LOW, ALL)"),
    min_value: Optional[float] = Query(None, description="Minimum order value in INR"),
    max_value: Optional[float] = Query(None, description="Maximum order value in INR"),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List orders with multi-attribute filtering, search, and pagination.
    """
    return get_orders(
        db=db,
        search=search,
        category=category,
        risk_level=risk_level,
        min_value=min_value,
        max_value=max_value,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size
    )

@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order_detail(order_id: str, db: Session = Depends(get_db)):
    """
    Get full hydrated order details including customer history, product info,
    return-risk prediction, feature explanation factors, and merchant review case.
    """
    return get_order_by_id(db=db, order_id=order_id)

@router.post("/{order_id}/evidence")
async def upload_evidence_endpoint(
    order_id: str,
    file: UploadFile = File(...),
    title: str = Form(...),
    evidence_type: str = Form("document"),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Attach and upload a real forensic evidence document (PDF, PNG, JPG, WEBP) to an order.
    """
    return await upload_order_evidence(
        db=db,
        order_id=order_id,
        file=file,
        title=title,
        evidence_type=evidence_type,
        notes=notes
    )

@router.post("", response_model=OrderDetailResponse, status_code=status.HTTP_201_CREATED)
def create_new_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order and automatically evaluate its return-risk propensity.
    """
    return create_order(db=db, order_in=order_in, auto_predict=True)

@router.get("/{order_id}/return-risk", response_model=ReturnRiskPredictResponse)
def get_order_return_risk(order_id: str, db: Session = Depends(get_db)):
    """
    Get or re-evaluate the return-risk prediction for a specific order.
    """
    order = get_order_by_id(db=db, order_id=order_id)
    if order.latest_prediction:
        return order.latest_prediction
        
    return predict_return_risk_for_order(
        db=db,
        order_input={
            "order_id": order.id,
            "customer_id": order.customer.customer_id,
            "product_id": order.product.product_id if order.product else None,
            "order_value": order.value,
            "product_category": order.product.category if order.product else "Apparel",
            "payment_method": order.payment_method,
            "delivery_type": order.delivery_status
        },
        persist=True
    )
