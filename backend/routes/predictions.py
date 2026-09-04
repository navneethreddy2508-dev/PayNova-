"""
Return-Risk Prediction API router.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.prediction import ReturnRiskPredictRequest, ReturnRiskPredictResponse
from backend.services.prediction_service import predict_return_risk_for_order

router = APIRouter(prefix="/return-risk", tags=["Return-Risk Prediction"])

@router.post("/predict", response_model=ReturnRiskPredictResponse, status_code=status.HTTP_200_OK)
def predict_return_risk(request: ReturnRiskPredictRequest, db: Session = Depends(get_db)):
    """
    Predict return probability, risk score (0-100), risk tier (LOW/MEDIUM/HIGH),
    revenue at risk in INR (₹), and feature explanation contributions for an e-commerce order.
    Persists prediction to database.
    """
    try:
        result = predict_return_risk_for_order(
            db=db,
            order_input=request.model_dump(),
            persist=True
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction inference failed: {str(e)}"
        )
