"""
Services initialization.
"""

from backend.services.audit_service import log_audit_event
from backend.services.prediction_service import predict_return_risk_for_order
from backend.services.order_service import get_orders, get_order_by_id, create_order
from backend.services.intervention_service import create_or_update_intervention
from backend.services.dashboard_service import get_dashboard_summary
from backend.services.customer_service import get_customer_by_id
from backend.services.product_service import get_product_by_id, get_all_products, get_category_analytics

__all__ = [
    "log_audit_event",
    "predict_return_risk_for_order",
    "get_orders",
    "get_order_by_id",
    "create_order",
    "create_or_update_intervention",
    "get_dashboard_summary",
    "get_customer_by_id",
    "get_product_by_id",
    "get_all_products",
    "get_category_analytics"
]
