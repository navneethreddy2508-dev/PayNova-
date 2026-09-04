# Architecture & System Design: AI Order Return-Risk Scorer

## 1. System Architecture Overview

The system is architected as an end-to-end intelligence platform linking a Single Page Application frontend, a high-performance FastAPI backend, a scikit-learn machine-learning inference pipeline, and an embedded SQLite database.

```
+------------------------------------------------------------------------------------+
|                         Frontend Client (Single Page App)                          |
|  * Dashboard View    * Orders Monitoring     * Order Details    * Analytics        |
|  * Investigation     * Audit Trail View      * Model Stats      * Settings         |
|  * Contextual AI Assistant Drawer (Vanilla JS + Tailwind CSS + Material Icons)     |
+------------------------------------------+-----------------------------------------+
                                           |
                                           | HTTP / REST (JSON) on Port 8000
                                           v
+------------------------------------------------------------------------------------+
|                                 FastAPI Backend Layer                              |
|  * CORS Middleware                  * Lifespan Auto-Database Ingestion             |
|  * Pydantic V2 Request Validation   * Clean JSON Serialization                     |
+------------------------------------------+-----------------------------------------+
                                           |
       +-----------------------------------+-----------------------------------+
       |                                                                       |
       v                                                                       v
+-------------------------------------+               +--------------------------------------+
|       Backend Services Layer        |               |      Machine Learning Subsystem      |
| * Prediction Service                |               | * Trained Random Forest (Joblib)     |
| * Order Filtering & Pagination      |<------------->| * Time-Aware Preprocessor Pipeline   |
| * Dashboard KPI Dynamic Aggregator  |  Feature Map  | * Feature Attribution Module         |
| * Human Intervention State Machine  |  Extraction   | * Risk Score & Tier Classification   |
| * Immutable Audit Event Logger      |               | * Model Version & Metadata Registry  |
+------------------+------------------+               +--------------------------------------+
                   |
                   v
+------------------------------------------------------------------------------------+
|                          SQLite Database (SQLAlchemy ORM)                          |
|  * orders                 * customers            * products                        |
|  * return_predictions     * return_interventions * audit_events                    |
|  * model_versions         * return_settings      (PRAGMA Foreign Keys Enabled)     |
+------------------------------------------------------------------------------------+
```

---

## 2. End-to-End Decision Flow

```
[Order Ingestion / Webhook]
           │
           ▼
[Pre-Dispatch Feature Extraction] (Order Value, Category, Multi-Size Flag, Customer History, COD/Prepaid)
           │
           ▼
[Stage 3 ML Model Inference] ────► P(Return) ∈ [0.0, 1.0], Risk Score (0-100), SHAP Factors
           │
           ▼
[Revenue at Risk Calculation] ────► Order Value × P(Return) in ₹ INR
           │
           ▼
[Threshold Calibration Check]
  ├── P(Return) < 40%  ──► Tagged LOW RISK ────► Fast-Tracked for Warehouse Packing
  ├── 40% ≤ P < 70%   ──► Tagged MEDIUM RISK ──► Monitored in Live Dashboard
  └── P(Return) ≥ 70%  ──► Tagged HIGH RISK ───► Escalated to Merchant Investigation Queue
                                                       │
                                                       ▼
[Human Merchant Review Console] ◄──────────────────────┘
  * Reviewer inspects SHAP feature attribution and customer history
  * Actions Available:
      - MONITOR: Keep in standard pipeline with telemetry
      - CUSTOMER_OUTREACH: WhatsApp/IVR confirmation for sizing/address
      - REVIEW: Case under active investigation
      - PREVENTIVE_ACTION: Senior Lead inspection for bracket purchasing
      - RESOLVED: Sizing confirmed with buyer; released for dispatch
                               │
                               ▼
[Immutable Audit Event Logger] ──► Records Actor, Action, Timestamp, Prior State, New State
```

---

## 3. Component Details

### Frontend Layer (`src/`)
* **Framework**: Modular Single Page Application (vanilla ES6+ JavaScript, Tailwind CSS design system, Material Symbols Outlined).
* **State Management**: Reactive central store (`src/state/store.js`) that synchronizes with the backend REST API (`src/services/api.js`) while supporting graceful offline mode.
* **Routing**: Hash-based client router (`src/router.js`) handling deep links and browser navigation without full-page reloads.

### Backend Layer (`backend/`)
* **Framework**: FastAPI (async ASGI framework) running with Uvicorn.
* **ORM & Database**: SQLAlchemy 2.0 connected to SQLite (`backend/data/return_risk.db`) with Foreign Key constraints enforced.
* **Data Protection**: Pydantic models validate input parameters and strip internal metadata from public responses.

### Machine Learning Layer (`ml/`)
* **Model Serialization**: Python `joblib` storing pre-fitted `ColumnTransformer` pipelines and the champion Random Forest estimator.
* **Explainability**: SHAP/weight feature attribution module translates mathematical weights into actionable merchant narratives.
