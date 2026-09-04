"""
Settings API router for dynamic risk score thresholds and system configuration.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.settings import ReturnSettings
from backend.schemas.settings import SettingsUpdateRequest, SettingsResponse
from backend.services.audit_service import log_audit_event

router = APIRouter(prefix="/settings", tags=["Return Settings"])

def get_or_create_settings(db: Session) -> ReturnSettings:
    settings = db.query(ReturnSettings).filter(ReturnSettings.setting_id == "default").first()
    if not settings:
        settings = ReturnSettings(
            setting_id="default",
            low_risk_threshold=39,
            medium_risk_threshold=40,
            high_risk_threshold=70,
            auto_flag_threshold=80,
            enable_realtime_inference=True,
            notify_email=True,
            notify_slack=False,
            active_engine="ReturnGuard-Ensemble (Random Forest)",
            currency_symbol="₹",
            currency_code="INR",
            locale="en-IN",
            updated_at=datetime.now(timezone.utc)
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("", response_model=SettingsResponse)
def get_return_settings(db: Session = Depends(get_db)):
    """Get active return-risk score thresholds and engine parameters."""
    settings = get_or_create_settings(db)
    return SettingsResponse(
        highRiskThreshold=settings.high_risk_threshold,
        mediumRiskThreshold=settings.medium_risk_threshold,
        lowRiskThreshold=settings.low_risk_threshold,
        autoFlagOrdersAbove=settings.auto_flag_threshold,
        enableRealtimeInference=settings.enable_realtime_inference,
        notifyHighRiskEmail=settings.notify_email,
        notifySlackWebhook=settings.notify_slack,
        activeEngine=settings.active_engine,
        currencySymbol=settings.currency_symbol,
        currencyCode=settings.currency_code,
        locale=settings.locale,
        updatedAt=settings.updated_at
    )

@router.put("", response_model=SettingsResponse)
def update_return_settings(update_in: SettingsUpdateRequest, db: Session = Depends(get_db)):
    """Update centralized risk thresholds and engine parameters."""
    settings = get_or_create_settings(db)
    
    changed_fields = []
    if update_in.high_risk_threshold is not None:
        settings.high_risk_threshold = update_in.high_risk_threshold
        changed_fields.append(f"High risk cutoff -> {update_in.high_risk_threshold}%")
    if update_in.medium_risk_threshold is not None:
        settings.medium_risk_threshold = update_in.medium_risk_threshold
        changed_fields.append(f"Medium risk cutoff -> {update_in.medium_risk_threshold}%")
    if update_in.low_risk_threshold is not None:
        settings.low_risk_threshold = update_in.low_risk_threshold
        changed_fields.append(f"Low risk cutoff -> {update_in.low_risk_threshold}%")
    if update_in.auto_flag_threshold is not None:
        settings.auto_flag_threshold = update_in.auto_flag_threshold
        changed_fields.append(f"Auto-flag cutoff -> {update_in.auto_flag_threshold}%")
    if update_in.enable_realtime_inference is not None:
        settings.enable_realtime_inference = update_in.enable_realtime_inference
    if update_in.notify_email is not None:
        settings.notify_email = update_in.notify_email
    if update_in.notify_slack is not None:
        settings.notify_slack = update_in.notify_slack
    if update_in.active_engine is not None:
        settings.active_engine = update_in.active_engine
        
    settings.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(settings)

    # Log Settings Update to Audit Trail
    if changed_fields:
        log_audit_event(
            db=db,
            actor="Jane Doe (Administrator)",
            action_type="SETTINGS_UPDATE",
            event_name="Return-Risk Settings & Thresholds Modified",
            details=f"Updated risk configuration: {', '.join(changed_fields)}",
            badge_color="blue",
            event_metadata={"changed_fields": changed_fields}
        )

    return SettingsResponse(
        highRiskThreshold=settings.high_risk_threshold,
        mediumRiskThreshold=settings.medium_risk_threshold,
        lowRiskThreshold=settings.low_risk_threshold,
        autoFlagOrdersAbove=settings.auto_flag_threshold,
        enableRealtimeInference=settings.enable_realtime_inference,
        notifyHighRiskEmail=settings.notify_email,
        notifySlackWebhook=settings.notify_slack,
        activeEngine=settings.active_engine,
        currencySymbol=settings.currency_symbol,
        currencyCode=settings.currency_code,
        locale=settings.locale,
        updatedAt=settings.updated_at
    )
