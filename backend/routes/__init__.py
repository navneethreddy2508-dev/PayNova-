"""
API routes initialization and aggregation.
"""

from fastapi import APIRouter
from backend.routes.predictions import router as predictions_router
from backend.routes.orders import router as orders_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.customers import router as customers_router
from backend.routes.products import router as products_router
from backend.routes.interventions import router as interventions_router
from backend.routes.audit import router as audit_router
from backend.routes.model_info import router as model_info_router
from backend.routes.settings import router as settings_router

api_router = APIRouter(prefix="/api")

api_router.include_router(predictions_router)
api_router.include_router(orders_router)
api_router.include_router(dashboard_router)
api_router.include_router(customers_router)
api_router.include_router(products_router)
api_router.include_router(interventions_router)
api_router.include_router(audit_router)
api_router.include_router(model_info_router)
api_router.include_router(settings_router)

__all__ = ["api_router"]
