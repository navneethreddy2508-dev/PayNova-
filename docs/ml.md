# Machine Learning Specification: AI Order Return-Risk Scorer

## 1. Prediction Objective & Mathematical Formulation

The core machine learning objective is to predict the conditional probability that an e-commerce **ORDER** will be returned or refunded by the customer after fulfillment:

$$P(\text{Return} = 1 \mid \mathbf{x}) \in [0.0, 1.0]$$

where $\mathbf{x} \in \mathbb{R}^d$ is the pre-dispatch feature vector extracted from the order context, customer historical behavioral patterns, and product category benchmarks.

### Continuous Risk Score ($0 - 100$)
$$\text{Risk Score} = \min\left(100, \max\left(0, \operatorname{round}(P(\text{Return} = 1 \mid \mathbf{x}) \times 100)\right)\right)$$

### Estimated Revenue at Risk (₹ INR)
$$\text{Estimated Revenue at Risk (₹)} = \text{Order Value (₹)} \times P(\text{Return} = 1 \mid \mathbf{x})$$

> **Important Interpretation Note**: Revenue at Risk represents expected merchandise return exposure to help merchants prioritize high-value return interventions before dispatch. It is **not** a guaranteed financial loss.

---

## 2. Zero Data Leakage Guarantee

A strict data governance policy was enforced across dataset generation, preprocessing, model training, and inference. The system uses **strictly pre-dispatch features** available at order placement or warehouse packing time.

### Forbidden Target Leakage Variables (Never Used in Pre-Return Prediction):
* ❌ Final delivery return status (`actual_return_date`)
* ❌ Refund processing timestamps or refund amounts
* ❌ Customer post-delivery return reason surveys
* ❌ Courier reverse-pickup tracking numbers
* ❌ Restocking warehouse inspection logs
* ❌ Payment gateway dispute/chargeback records

### Permitted Pre-Dispatch Input Features ($\mathbf{x}$):
1. `order_value`: Monetary transaction amount in ₹ INR.
2. `product_category`: Apparel, Footwear, Electronics, Furniture & Home, Personal Care, Jewelry.
3. `payment_method`: UPI, Credit/Debit Card, Netbanking, Cash on Delivery (COD).
4. `delivery_type`: Standard, Express, Same Day.
5. `delivery_delay_days`: Pre-dispatch fulfillment bottleneck or carrier estimated transit delay days.
6. `number_of_items`: Total quantity of SKUs in the shopping cart.
7. `is_multi_size_order`: Binary flag indicating bracket buying (ordering adjacent sizes of the same apparel/shoe item with intent to try on and return one).
8. `discount_percent`: Promotional markdown percentage ($0\% - 50\%$).
9. `is_first_time_customer`: Binary flag ($1$ if 0 lifetime orders, else $0$).
10. `customer_order_count`: Customer total lifetime orders completed.
11. `customer_previous_return_count`: Number of historical returns initiated by the customer.
12. `customer_previous_cancel_count`: Number of pre-dispatch order cancellations.
13. `customer_historical_return_rate`: Historical customer return propensity ($\frac{\text{Returns}}{\text{Orders}}$).
14. `customer_avg_order_value`: Customer historical average transaction size in ₹ INR.
15. `order_value_deviation`: Normalized deviation of order value from customer's historical average ($\frac{\text{Order Value} - \text{AOV}}{\text{AOV}}$).
16. `product_historical_return_rate`: Baseline return rate for the specific SKU.
17. `category_historical_return_rate`: Baseline return rate for the overarching department.

---

## 3. Dataset & Chronological Train/Test Partition

The training dataset comprises **15,000 synthetic e-commerce orders** calibrated to real-world Indian retail benchmarks.

### Time-Aware Validation Split (80% Train / 20% Test):
* **Training Set ($N = 12,000$)**: Orders placed chronologically between January 1, 2026 and July 15, 2026.
* **Held-Out Test Set ($N = 3,000$)**: Unseen future orders placed chronologically between July 16, 2026 and August 27, 2026.
* **Leakage Safeguard**: Preprocessors (`StandardScaler`, `OneHotEncoder`) were fit **exclusively on the training split** and transformed onto the test split to prevent test-set information bleed.

---

## 4. Model Training & Comparison Results

Three supervised learning architectures were trained and evaluated on the identical held-out test split ($N = 3,000$ unseen future orders):

| Metric | Logistic Regression (Baseline) | HistGradientBoosting | Random Forest (Champion) |
| :--- | :---: | :---: | :---: |
| **Accuracy** | 77.33% | 78.30% | **81.20%** |
| **Precision (Returns)** | 32.95% | 33.74% | **37.14%** |
| **Recall (Returns)** | 62.47% | 59.81% | **52.78%** |
| **F1 Score** | 43.14% | 43.14% | **43.60%** |
| **ROC-AUC** | 0.7709 | 0.7461 | **0.7541** |
| **False Positive Rate** | 20.29% | 18.75% | **14.26% (Lowest)** |
| **Est. FP Review Cost (₹)** | ₹26,250 | ₹24,250 | **₹18,450 (Lowest)** |

### Champion Model Selection Rationale
In high-volume e-commerce operations, false alarms induce merchant review fatigue and excessive customer friction. **Random Forest Classifier** achieved the highest overall accuracy ($81.20\%$), highest precision ($37.14\%$), and the lowest False Positive Rate ($14.26\%$), minimizing operational intervention costs by over $29\%$ compared to baseline models.

### Champion Confusion Matrix ($N = 3,000$ Held-Out Test Set):
```
                        Predicted Return (1)    Predicted Kept (0)
Actual Return (1)       TP = 218                FN = 195
Actual Kept (0)         FP = 369                TN = 2,218
```

---

## 5. Feature Importance & Attribution

Gini impurity feature importance ranking from the champion Random Forest model:

1. **Customer Historical Return Rate**: $19.05\%$
2. **Product Historical Return Rate**: $9.97\%$
3. **Order Value Deviation from Mean**: $9.84\%$
4. **Order Value (Ticket Size)**: $9.51\%$
5. **Customer Average Order Value**: $9.43\%$
6. **Bracket Buying Multi-Size Flag**: $9.33\%$
7. **Customer Previous Return Count**: $5.61\%$
8. **Promotional Discount Percentage**: $3.96\%$
9. **Payment Method (COD vs Prepaid)**: $3.42\%$
10. **Delivery Delay Days**: $2.88\%$

---

## 6. Risk Tier Classification & Governance Thresholds

Orders are categorized into three operational risk tiers based on active system thresholds:

* **LOW RETURN RISK ($P(\text{Return}) \le 39\%$)**: Standard fulfillment pipeline with no human intervention needed.
* **MEDIUM RETURN RISK ($40\% \le P(\text{Return}) \le 69\%$)**: Monitored queue; highlighted for potential address or size validation.
* **HIGH RETURN RISK ($P(\text{Return}) \ge 70\%$)**: Escalated to Merchant Review Queue; triggers pre-dispatch verification (e.g. WhatsApp confirmation or sizing double-check) before warehouse dispatch.
