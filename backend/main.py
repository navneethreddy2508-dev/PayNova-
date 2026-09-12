"""
Main FastAPI Application Entry Point for AI Order Return-Risk Scorer.
Provides RESTful APIs for Return Predictions, Orders, Dashboard, Customers, Analytics, Interventions, Audit, and Settings.
"""

import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.config import (
    PROJECT_NAME,
    PROJECT_VERSION,
    CORS_ORIGINS,
    CORS_ORIGIN_REGEX,
    HOST,
    PORT,
    SQLITE_DB_PATH
)
from backend.database import engine, Base, SessionLocal
from backend.models import Customer, Order, ReturnSettings, ModelVersion
from backend.routes import api_router, root_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifespan context.
    Ensures database tables exist and seeds demo data on initial startup.
    """
    try:
        # 1. Ensure tables exist
        Base.metadata.create_all(bind=engine)
        
        # 2. Check if DB is empty; if so, seed automatically
        db = SessionLocal()
        try:
            order_count = db.query(Order).count()
            if order_count == 0:
                print("[INFO] Empty database detected. Running initial seed...")
                from backend.seed import seed_database
                seed_database()
            else:
                print(f"[INFO] Connected to existing SQLite database ({order_count} orders present).")
        finally:
            db.close()
    except Exception as e:
        print(f"[WARN] Database initialization notice during startup: {e}")
        
    yield
    print("[INFO] AI Return-Risk Scorer API shutdown.")

app = FastAPI(
    title=PROJECT_NAME,
    version=PROJECT_VERSION,
    description="""
    ## AI Order Return-Risk Scorer — Enterprise Backend API
    
    A machine learning powered REST API predicting e-commerce order return probabilities,
    estimating revenue at risk in INR (₹), diagnosing behavioral risk factors,
    and managing human merchant intervention workflows.
    
    ### Core Capabilities:
    * **Return-Risk Predictions**: Supervised ML scoring for order return propensity.
    * **Revenue at Risk**: Financial merchandise exposure calculation (Order Value × Return Probability).
    * **Order Monitoring**: Multi-attribute filtering, search, and detail hydration.
    * **Merchant Review Workflow**: Internal actions (Monitor, Outreach, Review, Preventive, Resolved) with audit tracking.
    * **Executive Dashboard**: Dynamic database-computed KPIs, category breakups, and risk feeds.
    * **Explainability**: SHAP/Feature attribution explanations grounded in model weights.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Configure CORS for Frontend connectivity (LAN & Localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"\n[ERROR] Unhandled Exception at {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": f"{exc.__class__.__name__}: {str(exc)}",
            "type": exc.__class__.__name__,
            "path": str(request.url.path)
        }
    )

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Include API Routers (Mounts both /api/* and /* to handle Vercel proxying & local dev smoothly)
app.include_router(api_router)
app.include_router(root_router)

# Mount static frontend assets for single-service deployments (e.g. Render)
src_dir = os.path.join(PROJECT_ROOT, "src")
if os.path.exists(src_dir):
    app.mount("/src", StaticFiles(directory=src_dir), name="src")

@app.get("/", tags=["Frontend"])
def root():
    index_file = os.path.join(PROJECT_ROOT, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "status": "online",
        "service": PROJECT_NAME,
        "version": PROJECT_VERSION,
        "docs": "/docs",
        "currency": "INR (₹)"
    }

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite",
        "ml_engine": "ReturnGuard-Ensemble v1.0",
        "currency": "INR"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
