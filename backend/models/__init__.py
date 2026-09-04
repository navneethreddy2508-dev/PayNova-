"""
SQLAlchemy models initialization.
"""

from backend.models.customer import Customer
from backend.models.product import Product
from backend.models.order import Order
from backend.models.prediction import ReturnPrediction
from backend.models.intervention import ReturnIntervention
from backend.models.audit import AuditEvent
from backend.models.model_info import ModelVersion
from backend.models.settings import ReturnSettings

__all__ = [
    "Customer",
    "Product",
    "Order",
    "ReturnPrediction",
    "ReturnIntervention",
    "AuditEvent",
    "ModelVersion",
    "ReturnSettings"
]
