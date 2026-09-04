# AI Order Return-Risk Scorer — Enterprise E-Commerce Intelligence Platform

> **Predictive Supervised ML Engine & Merchant Intervention Platform for E-Commerce Order Returns & Revenue at Risk**

---

## 1. Problem Statement
E-commerce merchants frequently operate without visibility into post-dispatch customer return behavior. High return and refund rates across apparel, footwear, and consumer electronics create substantial operational strain, tying up merchant working capital and degrading net profitability.

---

## 2. Business Problem
In Indian direct-to-consumer (D2C) and marketplace retail:
* Gross return rates in fashion and footwear reach **25% – 40%**.
* Forward and reverse logistics costs erode merchant margins by **₹120 – ₹350 per returned package**.
* High Cash on Delivery (COD) adoption and customer **bracket purchasing** (ordering adjacent sizes with the intention of returning all but one) create predictable but unaddressed merchandise exposure.
* Traditional merchants only react *after* a return request is submitted, when two-way logistics costs are already irreversibly incurred.

---

## 3. Proposed Solution
The **AI Order Return-Risk Scorer** transforms return management from reactive handling to **proactive pre-dispatch optimization**. By analyzing pre-dispatch order parameters, customer behavioral baselines, and product category return signals, the platform:
1. Predicts order return probability before warehouse dispatch ($0.0 - 1.0$).
2. Generates a calibrated continuous Risk Score ($0 - 100$) and categorizes orders into Low, Medium, and High risk tiers.
3. Quantifies **Estimated Revenue at Risk in ₹ INR** ($\text{Order Value} \times P(\text{Return})$).
4. Explains contributing risk drivers using SHAP-derived feature attribution.
5. Empowers human merchant analysts to execute pre-dispatch verification interventions (e.g. WhatsApp sizing confirmation or address verification).
6. Records an immutable, chronological audit trail of all model predictions and human actions.

---

## 4. Key Features
* 📊 **Executive Return-Risk Dashboard**: Real-time business KPIs, category exposure distributions, monthly trends, and high-risk order queues.
* 🔎 **Order Monitoring Table**: Multi-attribute filtering by risk tier, product category, INR price range, order date, and real-time search with pagination.
* 🛍️ **Hydrated Order Details**: Integrated customer profile, SKU metadata, delivery delay attributes, and positive/negative risk contributors.
* 🧠 **Supervised ML Engine**: Champion Random Forest Classifier evaluated on a chronological held-out test split ($N = 3,000$).
* ⚖️ **Human-in-the-Loop Governance**: Decision support console with structured actions (`MONITOR`, `CUSTOMER_OUTREACH`, `REVIEW`, `PREVENTIVE_ACTION`, `RESOLVED`) without automated or irreversible cancellations.
* 📜 **Immutable Audit Trail**: Chronological event log tracking model scores, risk flags, merchant reviews, and configuration updates.
* 🤖 **Contextual AI Assistant**: Grounded drawer assistant providing factual return-risk explanations for the active order in ₹ INR.
* ⚙️ **Dynamic Threshold Calibration**: Configurable risk tier cutoffs with instant persistence to SQLite.

---

## 5. System Architecture

```
Frontend Single Page App (HTML5 / ES6+ / Tailwind CSS / Material Symbols)
                          ↓ HTTP / JSON REST APIs (Port 8000)
FastAPI Backend (Pydantic V2 Validation & Serialization)
                          ↓
Backend Services (Prediction, Orders, Dashboard, Interventions, Audit)
                          ↓
Return-Risk ML Model (Stage 3 Random Forest Champion via Joblib)
                          ↓
SQLite Database (SQLAlchemy ORM with PRAGMA Foreign Keys)
```

---

## 6. Dataset & Zero Data Leakage Guarantee
* **Dataset Size**: **15,000 synthetic e-commerce orders** calibrated to realistic Indian retail distributions.
* **Pre-Dispatch Signals Only**: Features strictly represent information available *before* dispatch:
  - `order_value` (₹ INR), `product_category`, `payment_method` (UPI/Card/COD), `delivery_type`, `delivery_delay_days`, `number_of_items`, `is_multi_size_order`, `discount_percent`, `customer_historical_return_rate`, `category_historical_return_rate`.
* **Zero Leakage**: No post-return variables (`actual_return_date`, `refund_status`, `dispute_logs`, or `restocking_condition`) are utilized.
* **Validation Split**: Chronological 80/20 train/test partition (12,000 training orders vs 3,000 unseen future test orders).

---

## 7. Machine Learning Pipeline & Champion Model
Three supervised learning architectures were trained and evaluated on the identical held-out test set:

| Metric | Logistic Regression (Baseline) | HistGradientBoosting | Random Forest (Champion) |
| :--- | :---: | :---: | :---: |
| **Accuracy** | 77.33% | 78.30% | **81.20%** |
| **Precision (Returns)** | 32.95% | 33.74% | **37.14%** |
| **Recall (Returns)** | 62.47% | 59.81% | **52.78%** |
| **F1 Score** | 43.14% | 43.14% | **43.60%** |
| **ROC-AUC** | 0.7709 | 0.7461 | **0.7541** |
| **False Positive Rate** | 20.29% | 18.75% | **14.26% (Lowest)** |
| **Est. FP Review Cost (₹)** | ₹26,250 | ₹24,250 | **₹18,450 (Lowest)** |

### Confusion Matrix ($N = 3,000$ Held-Out Test Set):
```
                        Predicted Return (1)    Predicted Kept (0)
Actual Return (1)       TP = 218                FN = 195
Actual Kept (0)         FP = 369                TN = 2,218
```

---

## 8. Return Probability, Risk Score & Revenue-at-Risk
* **Return Probability**: $P(\text{Return} = 1 \mid \mathbf{x}) \in [0.0, 1.0]$.
* **Risk Score**: $0 - 100$ integer scale.
* **Estimated Revenue at Risk (₹)**:
  $$\text{Estimated Revenue at Risk (₹)} = \text{Order Value (₹)} \times P(\text{Return})$$
  *(e.g., Order `#8921` valued at ₹12,490 with a 37.0% return probability has **₹4,621.30** estimated revenue at risk).*

---

## 9. Customer Behavior & Privacy
The system displays non-PII behavioral indicators for the selected order's customer:
* **Total Lifetime Orders**
* **Past Return Count** & **Historical Return Rate (%)**
* **Cancellation History**
* **Customer Segment** (e.g. *Frequent Returner*, *VIP Loyal Buyer*, *Price Sensitive*)

---

## 10. Product & Category Analytics
* Category return rate benchmarks: Apparel ($31.5\%$), Footwear ($28.4\%$), Electronics ($18.2\%$), Personal Care ($15.0\%$), Furniture ($14.0\%$), Jewelry ($11.0\%$).
* Diagnostic return driver analysis (e.g. Sizing & fit mismatch in apparel, Half-size variation in footwear, Buyer remorse in premium electronics).

---

## 11. Human Intervention & Audit Trail
* **Supported Human Actions**:
  - `MONITOR`: Keep in standard fulfillment with telemetry.
  - `CUSTOMER_OUTREACH`: Trigger pre-dispatch WhatsApp/IVR confirmation.
  - `REVIEW`: Place case under active merchant investigation.
  - `PREVENTIVE_ACTION`: Flag for senior analyst review.
  - `RESOLVED`: Sizing/address verified; order released for dispatch.
* **Audit Trail**: Every action, risk flag, model evaluation, and threshold change generates an immutable, timestamped audit log.

---

## 12. Quick Start & Installation

### Prerequisites
* Python 3.10+ (tested on Python 3.12)
* Modern web browser (Chrome, Edge, Firefox, Safari)

### Step 1: Clone & Setup Virtual Environment
```powershell
# Navigate to project directory
cd "Razor pay"

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 3: Initialize & Seed SQLite Database
```powershell
python backend/seed.py
```

### Step 4: Start FastAPI Backend Server
```powershell
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*API interactive documentation will be live at: `http://127.0.0.1:8000/docs`*

### Step 5: Launch Frontend Application
Open `index.html` in your browser, or start a local HTTP server:
```powershell
python -m http.server 3000
```
*Navigate to: `http://localhost:3000/index.html`*

---

## 13. Running Automated Tests

Run the complete test suite using `pytest`:
```powershell
pytest backend/tests -v
```
**Test Coverage**: 23 automated tests covering health endpoints, order ingestion, ML return prediction, revenue at risk calculation, customer/product lookups, merchant interventions, audit trail logging, and end-to-end lifecycle workflows.

---

## 14. Demo Presentation Script (5–7 Minutes)
A structured 5–7 minute walkthrough guide for hackathon presentations is provided in [`docs/demo.md`](docs/demo.md).

---

## 15. Documentation Index
* [docs/ml.md](docs/ml.md): Deep-dive Machine Learning documentation, feature equations, and data leakage safeguards.
* [docs/business-analytics.md](docs/business-analytics.md): E-commerce return economics, category benchmarks, and financial value framework.
* [docs/architecture.md](docs/architecture.md): End-to-end technical architecture, component breakdown, and decision flows.
* [docs/demo.md](docs/demo.md): Step-by-step hackathon live demo guide.

---

## 16. Limitations & Future Roadmap
* **Synthetic Dataset**: Utilizes 15,000 synthetic e-commerce orders calibrated to Indian retail distributions for privacy and demo consistency.
* **Database**: Embedded SQLite for local execution; production multi-node deployments would target PostgreSQL.
* **Human-in-the-Loop Safeguard**: The system intentionally does **not** execute autonomous order cancellations without merchant authorization.
* **Future Roadmap**: Real-time webhook ingestion for Shopify/WooCommerce, automated WhatsApp chatbot integrations for sizing confirmation, and continuous online model retraining.
