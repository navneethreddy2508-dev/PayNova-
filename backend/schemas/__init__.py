"""
Schemas initialization.
"""

from backend.schemas.customer import CustomerBase, CustomerCreate, CustomerResponse
from backend.schemas.product import ProductBase, ProductCreate, ProductResponse
from backend.schemas.prediction import (
    RiskFactor,
    ReturnRiskPredictRequest,
    ReturnRiskPredictResponse
)
from backend.schemas.intervention import (
    NoteItem,
    InterventionActionRequest,
    InterventionResponse
)
from backend.schemas.audit import AuditEventCreate, AuditEventResponse
from backend.schemas.order import (
    OrderCreate,
    OrderListItem,
    OrderListResponse,
    OrderDetailResponse
)
from backend.schemas.dashboard import (
    CategorySummary,
    MonthlyTrend,
    DashboardKPIs,
    DashboardSummaryResponse
)
from backend.schemas.model_info import (
    FeatureImportanceItem,
    ConfusionMatrix,
    ModelInfoResponse
)
from backend.schemas.settings import SettingsUpdateRequest, SettingsResponse

__all__ = [
    "CustomerBase", "CustomerCreate", "CustomerResponse",
    "ProductBase", "ProductCreate", "ProductResponse",
    "RiskFactor", "ReturnRiskPredictRequest", "ReturnRiskPredictResponse",
    "NoteItem", "InterventionActionRequest", "InterventionResponse",
    "AuditEventCreate", "AuditEventResponse",
    "OrderCreate", "OrderListItem", "OrderListResponse", "OrderDetailResponse",
    "CategorySummary", "MonthlyTrend", "DashboardKPIs", "DashboardSummaryResponse",
    "FeatureImportanceItem", "ConfusionMatrix", "ModelInfoResponse",
    "SettingsUpdateRequest", "SettingsResponse"
]
