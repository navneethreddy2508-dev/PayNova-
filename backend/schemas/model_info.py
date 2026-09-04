"""
Pydantic schemas for Model Performance metadata.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class FeatureImportanceItem(BaseModel):
    feature: str
    score: float

    model_config = ConfigDict(from_attributes=True)

class ConfusionMatrix(BaseModel):
    truePositive: int
    falsePositive: int
    falseNegative: int
    trueNegative: int

    model_config = ConfigDict(from_attributes=True)

class ModelInfoResponse(BaseModel):
    modelName: str
    modelVersion: str
    championAlgorithm: str
    lastTrained: str
    trainingDatasetSize: str
    testDatasetSize: str
    totalFeatures: int
    accuracy: str
    precision: str
    recall: str
    f1Score: str
    rocAuc: str
    falsePositiveRate: str
    estFalsePositiveCost: int # INR
    status: str
    confusionMatrix: ConfusionMatrix
    featureImportance: List[FeatureImportanceItem]
    allModelComparison: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)
