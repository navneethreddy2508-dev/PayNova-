# Demonstration Guide & Hackathon Presentation Script (5–7 Minutes)

## AI Order Return-Risk Scorer: Live Demo Flow

This document provides a step-by-step presentation script designed for hackathon judges and e-commerce operations stakeholders.

---

### Minute 0:00 – 1:00: Problem Context & Problem Statement
* **Speaker Script**:
  > *"In Indian e-commerce, high product returns in fashion, footwear, and electronics consume up to 30% of gross margins due to two-way forward and reverse logistics costs. Today, merchants only react after an item is returned. Our solution is the **AI Order Return-Risk Scorer** — a machine-learning intelligence platform that predicts return propensity **before warehouse dispatch**, quantifies **Revenue at Risk in ₹ INR**, explains why, and empowers merchants to take proactive verification actions."*

---

### Minute 1:00 – 2:00: Executive Return-Risk Dashboard
* **Action**: Open the application at `index.html` (or `#/dashboard`).
* **Highlights to Show**:
  1. **Bento KPI Grid**: Total Orders Monitored ($2,450$), **Estimated Revenue at Risk (₹6.2 Lakhs)**, Predicted Return Rate ($12.9\%$), and Risk Tier distribution.
  2. **Monthly Trend Chart**: Compare monthly flagged revenue vs actual revenue recovered through merchant verifications.
  3. **High-Risk Orders Queue**: Highlight Order `#ORD-8921` and `#ORD-8919` flagged in the real-time queue.

---

### Minute 2:00 – 3:30: Order Monitoring & High-Risk Case Exploration
* **Action**: Click **Order Monitoring** from top navigation (`#/orders`).
* **Highlights to Show**:
  1. **Multi-Attribute Filters**: Filter by Risk Tier (`HIGH` or `MEDIUM`), filter by Category (`Apparel` or `Electronics`), or search for a specific customer.
  2. **Order Detail Hydration**: Click on Order **#ORD-8921** (or **#ORD-8919**).
  3. **Customer Behavioral Profile**: Show customer **Priya Sharma** (Lifetime return rate $42.8\%$, 14 orders).
  4. **Product Analytics**: Show SKU **AcousticWave ANC Headphones** (Price: ₹12,490, SKU return rate $24.5\%$).
  5. **Feature Attribution (AI Explainability)**: Point out top contributing factors (e.g. *Bracket purchasing detected $+45\%$*, *Customer return history $+27\%$*).
  6. **Revenue at Risk**: Show calculation: $\text{Order Value } ₹12,490 \times 37.0\% = \mathbf{₹4,621.30}$.

---

### Minute 3:30 – 4:30: Human Merchant Intervention & Audit Trail
* **Action**: Click **Investigate & Merchant Action** (`#/investigation/8921`).
* **Highlights to Show**:
  1. **Governance Safeguard**: Emphasize that the AI does **not** autonomously cancel orders or blacklist customers. Human analysts remain in control.
  2. **Take an Action**: Click **Request Verification** (Customer Outreach).
  3. **Add Review Note**: Type *"Customer verified sizing and address via WhatsApp; shipping confirmed."* and submit.
  4. **Audit Trail**: Open **Audit Trail** (`#/audit`). Show the new immutable audit event recorded with actor name, timestamp, and metadata.

---

### Minute 4:30 – 5:30: Model Performance & Return Settings
* **Action**: Navigate to **Model Stats** (`#/model-stats`) and **Settings** (`#/settings`).
* **Highlights to Show**:
  1. **Champion Model Performance**: Show real test set metrics evaluated on $3,000$ unseen future orders: Accuracy $81.2\%$, Recall $52.8\%$, ROC-AUC $0.7541$, and Confusion Matrix ($\text{TP}=218, \text{TN}=2218$).
  2. **Dynamic Risk Calibration**: In Settings, adjust the High Risk threshold slider from $70\%$ to $75\%$ and click **Save Changes**. Show how threshold adjustments persist directly to SQLite.

---

### Minute 5:30 – 6:30: Contextual AI Assistant
* **Action**: Click the floating **AI Return-Risk Assistant** button in the bottom right corner.
* **Highlights to Show**:
  1. Click suggested chips: *"Why high risk?"*, *"Customer History"*, or *"How much revenue is at risk?"*.
  2. Observe immediate, grounded responses tailored precisely to the active order in ₹ INR without hallucinations.

---

### Minute 6:30 – 7:00: Summary & Conclusion
* **Speaker Script**:
  > *"By combining a supervised Random Forest return-risk engine, SHAP feature attribution, and human-in-the-loop merchant workflows, the AI Order Return-Risk Scorer helps e-commerce brands proactively protect profit margins, cut reverse logistics waste, and improve customer sizing fit before dispatch."*
