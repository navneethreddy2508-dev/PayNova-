# AI Order Return-Risk Scorer — Backend & Database Architecture Documentation

## 1. Executive Summary

The backend layer of the **AI Order Return-Risk Scorer** serves as the central intelligence and data orchestration hub. It bridges the modern Stitch-designed frontend UI with the Stage 3 supervised machine-learning model (Random Forest Classifier) and a persistent SQLite database.

```
+-------------------------------------------------------------------------------+
|                      Frontend Single Page Application                         |
|  (Order Monitoring, Return-Risk Dashboard, Investigation, Audit Trail, Stats) |
+---------------------------------------+---------------------------------------+
                                        | HTTP / JSON REST APIs (CORS Enabled)
                                        v
+-------------------------------------------------------------------------------+
|                      FastAPI Application (Port 8000)                          |
|               Pydantic Request Validation & Response Serialization            |
+---------------------------------------+---------------------------------------+
                                        |
       +--------------------------------+--------------------------------+
       |                                                                 |
       v                                                                 v
+-----------------------------+                           +-----------------------------+
|    Backend Services Layer   |                           | Stage 3 ML Engine (Joblib)  |
| * Prediction Service        |                           | * Random Forest Classifier  |
| * Order & Query Service     |<------------------------->| * Preprocessor Pipeline     |
| * Dashboard KPI Aggregator  |      Real-time Feature    | * Feature Attribution       |
| * Intervention & Audit Logs |         Extraction        | * P(Return), Score (0-100)  |
+--------------+--------------+                           +-----------------------------+
               |
               v
+-------------------------------------------------------------------------------+
|                        SQLite Database (SQLAlchemy ORM)                       |
|  orders | customers | products | return_predictions | interventions | audit    |
+-------------------------------------------------------------------------------+
```

---

## 2. Database Schema Design (SQLite + SQLAlchemy)

The database is defined with SQLite PRAGMA Foreign Keys enabled and indexed queries for rapid UI responsiveness.

### Tables Overview:

| Table Name | Primary Key | Description |
| :--- | :--- | :--- |
| `orders` | `order_id` | E-commerce orders, customer FK, product FK, order value (₹ INR), payment method, delivery mode, pre-dispatch attributes (zero leakage). |
| `customers` | `customer_id` | Customer behavioral baseline, total orders, historical return rate, cancellation counts, average order value (INR). |
| `products` | `product_id` | Catalog items, SKU, category, price (INR), category return rate baseline, common return reasons. |
| `return_predictions` | `prediction_id` | Output of ML model scoring: `return_probability` (0-1), `risk_score` (0-100), `risk_level` (LOW/MEDIUM/HIGH), `revenue_at_risk` (INR), top risk factors JSON. |
| `return_interventions` | `intervention_id` | Merchant review workflow cases (`case_id`), action (`MONITOR`, `CUSTOMER_OUTREACH`, `REVIEW`, `PREVENTIVE_ACTION`, `RESOLVED`), status, analyst notes. |
| `audit_events` | `event_id` | Immutable chronological trail of AI model evaluations, risk flags, merchant reviews, and configuration updates. |
| `model_versions` | `version_id` | Champion ML model metadata, evaluation metrics (Accuracy 81.2%, Recall 52.8%, ROC-AUC 0.7541), confusion matrix, feature importance. |
| `return_settings` | `setting_id` | Centralized risk score thresholds (`low_risk_threshold: 39`, `high_risk_threshold: 70`, `auto_flag: 80`), notification flags, active model engine. |

---

## 3. REST API Specification (`/api`)

### Prediction Endpoints
* `POST /api/return-risk/predict`
  * **Input**: `order_value` (INR), `product_category`, `payment_method`, `delivery_type`, `delivery_delay_days`, `number_of_items`, `is_multi_size_order`, customer behavioral overrides.
  * **Output**: `order_id`, `return_probability`, `risk_score` (0-100), `risk_level` (LOW/MEDIUM/HIGH), `order_value_inr`, `revenue_at_risk_inr`, `top_risk_factors` (with impact percentages and types), `model_version`.

### Order Monitoring Endpoints
* `GET /api/orders`
  * **Query Params**: `search`, `category`, `risk_level` (LOW/MEDIUM/HIGH), `min_value`, `max_value`, `date_from`, `date_to`, `page`, `page_size`.
  * **Output**: Paginated order list with calculated return probability, risk tier, revenue at risk (₹), and review status.
* `GET /api/orders/{order_id}`
  * **Output**: Fully hydrated order details, customer behavioral profile, product details, ML prediction factors, evidence attachments, and active review case.
* `POST /api/orders`
  * **Output**: Ingests new order, automatically executes ML return-risk scoring, and persists prediction.
* `GET /api/orders/{order_id}/return-risk`
  * **Output**: Returns or re-evaluates the return-risk scoring for a specific order.

### Dashboard & Analytics Endpoints
* `GET /api/dashboard/summary`
  * **Output**: Live DB-aggregated KPIs: Total monitored orders, total revenue monitored (₹), predicted return rate (%), revenue at risk (₹), recovered revenue (₹), risk tier breakdown, category risk distribution, monthly trends.
* `GET /api/analytics/categories`
  * **Output**: Return rate baselines and top return drivers per catalog category.
* `GET /api/customers/{customer_id}`
  * **Output**: Customer profile with safe pre-dispatch behavioral return history.
* `GET /api/products` & `GET /api/products/{product_id}`
  * **Output**: Catalog items and baseline return rate metadata.

### Merchant Review & Audit Trail Endpoints
* `POST /api/interventions`
  * **Input**: `order_id`, `action` (`MONITOR`, `CUSTOMER_OUTREACH`, `REVIEW`, `PREVENTIVE_ACTION`, `RESOLVED`), `reviewer`, `note_text`, `status`.
  * **Output**: Updated case; automatically emits an immutable event to `audit_events`.
* `GET /api/interventions/{order_id}`
  * **Output**: Active investigation case and reviewer notes history.
* `GET /api/audit-events`
  * **Output**: Chronological audit trail with filter options by `order_id` or `action_type`.

### Model Diagnostics & Settings Endpoints
* `GET /api/model`
  * **Output**: Real Stage 3 ML model performance metrics, confusion matrix ($N=3,000$), and feature importance rankings.
* `GET /api/settings` & `PUT /api/settings`
  * **Output**: Dynamic risk threshold configuration ($0-100\%$) and notification options.

---

## 4. Test Suite Coverage & Verification

Automated test suite implemented in `backend/tests/` executed via `pytest`:

```
============================= test session starts =============================
platform win32 -- Python 3.12.4, pytest-9.1.1, pluggy-1.6.0
collected 21 items

backend/tests/test_customers_products_api.py::test_get_customer_success PASSED  [  4%]
backend/tests/test_customers_products_api.py::test_get_customer_not_found PASSED [  9%]
backend/tests/test_customers_products_api.py::test_list_products PASSED         [ 14%]
backend/tests/test_customers_products_api.py::test_get_product_detail PASSED    [ 19%]
backend/tests/test_customers_products_api.py::test_get_category_analytics PASSED [ 23%]
backend/tests/test_dashboard_api.py::test_get_dashboard_summary PASSED          [ 28%]
backend/tests/test_interventions_api.py::test_submit_intervention_action PASSED [ 33%]
backend/tests/test_interventions_api.py::test_get_intervention_by_order_id PASSED [ 38%]
backend/tests/test_model_and_settings_api.py::test_get_model_performance PASSED [ 42%]
backend/tests/test_model_and_settings_api.py::test_get_and_update_settings PASSED [ 47%]
backend/tests/test_model_and_settings_api.py::test_get_audit_events_list PASSED [ 52%]
backend/tests/test_orders_api.py::test_list_orders_unfiltered PASSED            [ 57%]
backend/tests/test_orders_api.py::test_list_orders_search_filter PASSED         [ 61%]
backend/tests/test_orders_api.py::test_list_orders_category_filter PASSED        [ 66%]
backend/tests/test_orders_api.py::test_list_orders_risk_level_filter PASSED     [ 71%]
backend/tests/test_orders_api.py::test_get_order_detail_success PASSED          [ 76%]
backend/tests/test_orders_api.py::test_get_order_detail_not_found PASSED        [ 80%]
backend/tests/test_orders_api.py::test_create_order_success PASSED              [ 85%]
backend/tests/test_prediction_api.py::test_predict_return_risk_high_risk_order PASSED [ 90%]
backend/tests/test_prediction_api.py::test_predict_return_risk_low_risk_order PASSED [ 95%]
backend/tests/test_prediction_api.py::test_predict_return_risk_invalid_input PASSED [100%]

====================== 21 passed in 2.56s =======================
```
