"""
Backend Configuration for AI Order Return-Risk Scorer.
"""

import os
from pathlib import Path

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Database
SQLITE_DB_PATH = DATA_DIR / "return_risk.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{SQLITE_DB_PATH}")

# ML Model Paths
ML_MODEL_PATH = PROJECT_ROOT / "ml" / "models" / "best_model.joblib"
ML_METADATA_PATH = PROJECT_ROOT / "ml" / "models" / "model_metadata.json"

# API & Server Settings
API_V1_PREFIX = "/api"
PROJECT_NAME = "AI Order Return-Risk Scorer API"
PROJECT_VERSION = "1.0.0"

# CORS Configuration (Allows localhost, 127.0.0.1, and any local LAN IP like 192.168.x.x)
CORS_ORIGIN_REGEX = r"^https?://.*"
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# Currency & Locale
CURRENCY_SYMBOL = "₹"
CURRENCY_CODE = "INR"
DEFAULT_LOCALE = "en-IN"

# Default Return-Risk Thresholds
DEFAULT_LOW_RISK_MAX = 0.39     # 0% - 39% -> LOW
DEFAULT_MEDIUM_RISK_MAX = 0.69  # 40% - 69% -> MEDIUM
DEFAULT_HIGH_RISK_MIN = 0.70    # 70% - 100% -> HIGH
