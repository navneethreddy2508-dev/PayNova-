"""
Order service providing querying, multi-attribute filtering, pagination, and detail hydration.
"""

import os
import shutil
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func
from fastapi import HTTPException, UploadFile

from backend.config import PROJECT_ROOT
from backend.models.order import Order
from backend.models.customer import Customer
from backend.models.product import Product
from backend.models.prediction import ReturnPrediction
from backend.models.intervention import ReturnIntervention
from backend.schemas.order import OrderCreate, OrderListItem, OrderListResponse, OrderDetailResponse
from backend.services.prediction_service import predict_return_risk_for_order
from backend.services.audit_service import log_audit_event

EVIDENCE_UPLOAD_DIR = PROJECT_ROOT / "backend" / "data" / "evidence_uploads"
EVIDENCE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# In-memory registry for uploaded evidence linked to orders
ORDER_EVIDENCE_STORE: Dict[str, List[Dict[str, Any]]] = {}

def get_orders(
    db: Session,
    search: Optional[str] = None,
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
) -> OrderListResponse:
    """
    Retrieves filtered and paginated list of orders for the Order Monitoring table.
    """
    query = db.query(Order).join(Customer, Order.customer_id == Customer.customer_id)
    
    # 1. Search Query Filter
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Order.order_id.ilike(search_term),
                Order.order_code.ilike(search_term),
                Order.category.ilike(search_term),
                Customer.customer_name.ilike(search_term),
                Customer.email.ilike(search_term)
            )
        )

    # 2. Category Filter
    if category and category.lower() != "all":
        query = query.filter(Order.category.ilike(f"%{category}%"))

    # 3. Monetary Value Filters
    if min_value is not None:
        query = query.filter(Order.order_value >= min_value)
    if max_value is not None:
        query = query.filter(Order.order_value <= max_value)

    # 4. Date Range Filters
    if date_from:
        query = query.filter(Order.order_date >= date_from)
    if date_to:
        query = query.filter(Order.order_date <= date_to)

    # Execute and hydrate
    all_matching_orders = query.order_by(desc(Order.created_at)).all()
    
    items: List[OrderListItem] = []
    for o in all_matching_orders:
        latest_pred = o.predictions[0] if o.predictions else None
        latest_int = o.interventions[0] if o.interventions else None
        
        prob = int(round(latest_pred.return_probability * 100)) if latest_pred else 15
        r_level = latest_pred.risk_level if latest_pred else "LOW"
        rev_at_risk = latest_pred.revenue_at_risk if latest_pred else round(o.order_value * (prob / 100.0), 2)
        
        # Risk level filter check
        if risk_level and risk_level.upper() != "ALL":
            if r_level.upper() != risk_level.upper():
                continue
                
        # Status determination
        status = latest_int.status if latest_int else ("Action Required" if r_level == "HIGH" else "Monitored")
        product_title = o.product.product_name if o.product else f"{o.category} Item"

        items.append(
            OrderListItem(
                id=o.order_id,
                code=o.order_code,
                customer_name=o.customer.customer_name if o.customer else "Customer",
                customer_avatar=o.customer.avatar_url if o.customer else None,
                category=o.category,
                product_name=product_title,
                value=o.order_value,
                date=o.order_date,
                formatted_date=o.formatted_date,
                payment_method=o.payment_method,
                delivery_status=o.delivery_status,
                return_probability=prob,
                risk_level=r_level,
                revenue_at_risk=rev_at_risk,
                case_id=latest_int.case_id if latest_int else None,
                status=status
            )
        )

    total_count = len(items)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_items = items[start_idx:end_idx]

    return OrderListResponse(
        total=total_count,
        page=page,
        page_size=page_size,
        items=paginated_items
    )

def get_order_by_id(db: Session, order_id: str) -> OrderDetailResponse:
    """
    Retrieves full hydrated order details for Order Detail & Investigation pages.
    """
    clean_id = order_id.replace("#ORD-", "").replace("ORD-", "")
    order = db.query(Order).filter(
        or_(Order.order_id == clean_id, Order.order_id == order_id, Order.order_code == order_id)
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found.")

    latest_pred = order.predictions[0] if order.predictions else None
    latest_int = order.interventions[0] if order.interventions else None
    
    # If no prediction exists yet, generate one on the fly
    if not latest_pred:
        predict_res = predict_return_risk_for_order(
            db=db,
            order_input={
                "order_id": order.order_id,
                "customer_id": order.customer_id,
                "product_id": order.product_id,
                "order_value": order.order_value,
                "product_category": order.category,
                "payment_method": order.payment_method,
                "delivery_type": order.delivery_type,
                "delivery_delay_days": order.delivery_delay_days,
                "number_of_items": order.number_of_items,
                "is_multi_size_order": order.is_multi_size_order,
                "discount_percent": order.discount_percent
            },
            persist=True
        )
        latest_pred = order.predictions[0]

    prob = int(round(latest_pred.return_probability * 100))
    risk_level = latest_pred.risk_level
    rev_at_risk = latest_pred.revenue_at_risk
    status = latest_int.status if latest_int else ("Action Required" if risk_level == "HIGH" else "Monitored")

    # Construct sample evidence attachment objects
    evidence = []
    if order.payment_method == "COD":
        evidence.append({
            "id": f"EV-COD-{order.order_id}",
            "title": "COD Delivery Verification Call Log",
            "type": "history",
            "date": order.formatted_date or "Recent",
            "file": f"IVR_CONFIRM_{order.order_id}.wav"
        })
    if order.is_multi_size_order == 1:
        evidence.append({
            "id": f"EV-SZ-{order.order_id}",
            "title": "Multi-Size Bracket Purchase Cart Snapshot",
            "type": "image",
            "date": order.formatted_date or "Recent",
            "file": f"BRACKET_CART_{order.order_id}.png"
        })

    # Append any uploaded evidence from store
    if clean_id in ORDER_EVIDENCE_STORE:
        evidence.extend(ORDER_EVIDENCE_STORE[clean_id])
    if order.order_id in ORDER_EVIDENCE_STORE and order.order_id != clean_id:
        evidence.extend(ORDER_EVIDENCE_STORE[order.order_id])

    return OrderDetailResponse(
        id=order.order_id,
        code=order.order_code,
        customer=order.customer,
        product=order.product,
        value=order.order_value,
        date=order.order_date,
        formatted_date=order.formatted_date,
        payment_method=order.payment_method,
        delivery_status=order.delivery_status,
        delivery_date=order.delivery_date,
        shipping_city=order.shipping_city,
        return_probability=prob,
        risk_level=risk_level,
        revenue_at_risk=rev_at_risk,
        case_id=latest_int.case_id if latest_int else None,
        status=status,
        factors=latest_pred.risk_factors or [],
        evidence=evidence,
        latest_prediction=latest_pred,
        latest_intervention=latest_int
    )

def create_order(db: Session, order_in: OrderCreate, auto_predict: bool = True) -> OrderDetailResponse:
    """
    Creates a new order in the database and triggers ML return-risk scoring.
    """
    order_id = order_in.order_id or f"ORD-{uuid.uuid4().hex[:6].upper()}"
    order_code = f"#ORD-{order_id.replace('ORD-', '')}"
    
    # 1. Verify or auto-provision customer
    customer = db.query(Customer).filter(Customer.customer_id == order_in.customer_id).first()
    if not customer:
        cust_name = order_in.customer_name or f"Customer {order_in.customer_id}"
        ret_rate = float(order_in.customer_return_rate if order_in.customer_return_rate is not None else 0.15)
        prev_returns = int(order_in.customer_previous_returns if order_in.customer_previous_returns is not None else int(round(ret_rate * 10)))
        total_orders = int(order_in.customer_total_orders if order_in.customer_total_orders is not None else max(prev_returns + 2, 5))
        
        customer = Customer(
            customer_id=order_in.customer_id,
            customer_name=cust_name,
            email=f"{order_in.customer_id.lower().replace(' ', '_').replace('-', '_')}@example.in",
            location=order_in.shipping_city or "Mumbai, Maharashtra",
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            total_orders=total_orders,
            previous_returns=prev_returns,
            previous_cancellations=1,
            historical_return_rate=ret_rate,
            average_order_value=order_in.order_value,
            customer_segment="High Return Risk" if ret_rate >= 0.35 else ("Moderate Return Risk" if ret_rate >= 0.20 else "Loyal Customer"),
            notes="Provisioned via PayNova Order Simulator."
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # 2. Verify or auto-provision product
    product_id = order_in.product_id
    if product_id:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            p_name = order_in.product_name or f"{order_in.category} Item"
            product = Product(
                product_id=product_id,
                product_name=p_name,
                sku=f"SKU-{order_in.category[:3].upper()}-{product_id[:6].upper()}",
                category=order_in.category,
                price=order_in.order_value,
                image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
                category_return_rate=0.18 if order_in.category == "Apparel" else 0.12,
                historical_return_rate=0.20,
                common_return_reasons=["Size / Fit mismatch", "Buyer remorse"]
            )
            db.add(product)
            db.commit()
            db.refresh(product)

    # 3. Create or update Order
    existing_order = db.query(Order).filter(
        or_(Order.order_id == order_id, Order.order_code == order_code)
    ).first()
    
    if existing_order:
        existing_order.customer_id = order_in.customer_id
        existing_order.product_id = product_id
        existing_order.category = order_in.category
        existing_order.order_value = order_in.order_value
        existing_order.currency = order_in.currency
        existing_order.formatted_date = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")
        existing_order.payment_method = order_in.payment_method
        existing_order.delivery_type = order_in.delivery_type
        existing_order.delivery_status = order_in.delivery_status
        existing_order.shipping_city = order_in.shipping_city
        existing_order.delivery_delay_days = order_in.delivery_delay_days
        existing_order.number_of_items = order_in.number_of_items
        existing_order.is_multi_size_order = order_in.is_multi_size_order
        existing_order.discount_percent = order_in.discount_percent
        new_order = existing_order
        db.commit()
        db.refresh(new_order)
    else:
        new_order = Order(
            order_id=order_id,
            order_code=order_code,
            customer_id=order_in.customer_id,
            product_id=product_id,
            category=order_in.category,
            order_value=order_in.order_value,
            currency=order_in.currency,
            order_date=order_in.order_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            formatted_date=datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p"),
            payment_method=order_in.payment_method,
            delivery_type=order_in.delivery_type,
            delivery_status=order_in.delivery_status,
            delivery_date=order_in.delivery_date or "Expected 3 Days",
            shipping_city=order_in.shipping_city,
            delivery_delay_days=order_in.delivery_delay_days,
            number_of_items=order_in.number_of_items,
            is_multi_size_order=order_in.is_multi_size_order,
            discount_percent=order_in.discount_percent,
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)

    if auto_predict:
        predict_return_risk_for_order(
            db=db,
            order_input={
                "order_id": new_order.order_id,
                "customer_id": new_order.customer_id,
                "product_id": new_order.product_id,
                "order_value": new_order.order_value,
                "product_category": new_order.category,
                "payment_method": new_order.payment_method,
                "delivery_type": new_order.delivery_type,
                "delivery_delay_days": new_order.delivery_delay_days,
                "number_of_items": new_order.number_of_items,
                "is_multi_size_order": new_order.is_multi_size_order,
                "discount_percent": new_order.discount_percent,
                "customer_historical_return_rate": order_in.customer_return_rate,
                "customer_order_count": order_in.customer_total_orders,
                "customer_previous_return_count": order_in.customer_previous_returns
            },
            persist=True
        )

    return get_order_by_id(db, new_order.order_id)

async def upload_order_evidence(
    db: Session,
    order_id: str,
    file: UploadFile,
    title: str,
    evidence_type: str = "document",
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Saves a real evidence file to local storage, links it to the order, and appends an audit event.
    """
    clean_id = order_id.replace("#ORD-", "").replace("ORD-", "")
    order = db.query(Order).filter(
        or_(Order.order_id == clean_id, Order.order_id == order_id, Order.order_code == order_id)
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found.")

    filename = file.filename or "evidence.bin"
    ext = os.path.splitext(filename)[1].lower()
    allowed_extensions = {".png", ".jpg", ".jpeg", ".pdf", ".webp"}
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed types: PNG, JPG, JPEG, PDF, WEBP."
        )

    ev_id = f"EV-{uuid.uuid4().hex[:6].upper()}"
    safe_filename = f"{ev_id}_{filename}"
    file_path = EVIDENCE_UPLOAD_DIR / safe_filename

    contents = await file.read()
    file_size = len(contents)
    with open(file_path, "wb") as f:
        f.write(contents)

    formatted_time = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")
    evidence_item = {
        "id": ev_id,
        "title": title or "Supporting Attachment",
        "type": evidence_type or "document",
        "date": formatted_time,
        "file": filename,
        "file_name": filename,
        "saved_filename": safe_filename,
        "size": file_size,
        "notes": notes or ""
    }

    if clean_id not in ORDER_EVIDENCE_STORE:
        ORDER_EVIDENCE_STORE[clean_id] = []
    ORDER_EVIDENCE_STORE[clean_id].append(evidence_item)

    # Log to audit trail
    latest_pred = order.predictions[0] if order.predictions else None
    prob_str = f"{int(round(latest_pred.return_probability * 100))}%" if latest_pred else "N/A"
    
    log_audit_event(
        db=db,
        event_name="Evidence Attached",
        order_id=order.order_id,
        action_type="EVIDENCE_ATTACH",
        actor="Navneeth (Senior Risk Analyst)",
        return_probability=prob_str,
        model_version="ReturnGuard-Ensemble v1.0",
        badge_color="blue",
        details=f"Attached evidence '{filename}' ({title}) for Order #{order.order_id}."
    )

    return {
        "status": "success",
        "evidence": evidence_item,
        "message": "Forensic evidence attached successfully and logged in audit trail."
    }
