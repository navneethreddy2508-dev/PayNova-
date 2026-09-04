"""
ModelVersion model persisting Stage 3 ML model architecture, evaluation metrics, and feature importances.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON
from backend.database import Base

class ModelVersion(Base):
    __tablename__ = "model_versions"

    version_id = Column(String(64), primary_key=True, index=True) # e.g. "v1.0"
    model_name = Column(String(128), nullable=False)
    model_version = Column(String(64), nullable=False)
    champion_algorithm = Column(String(128), default="Random Forest Classifier")
    
    training_date = Column(String(64), default="Aug 2026")
    dataset_version = Column(String(64), default="synthetic-ecommerce-orders-v1.0")
    training_dataset_size = Column(String(64), default="12,000 Orders")
    test_dataset_size = Column(String(64), default="3,000 Orders (Time-Aware Split)")
    
    # Quantitative Test Metrics
    accuracy = Column(String(16), default="81.2%")
    precision = Column(String(16), default="37.1%")
    recall = Column(String(16), default="52.8%")
    f1_score = Column(String(16), default="43.6%")
    roc_auc = Column(String(16), default="0.7541")
    false_positive_rate = Column(String(16), default="14.3%")
    est_fp_cost_inr = Column(Integer, default=18450)
    
    confusion_matrix = Column(JSON, default=dict)
    top_feature_importances = Column(JSON, default=list)
    all_model_comparison = Column(JSON, default=dict)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
