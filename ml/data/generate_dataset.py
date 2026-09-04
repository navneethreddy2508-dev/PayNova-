"""
Synthetic E-Commerce Order Dataset Generator for Return-Risk Modeling.
All monetary values in INR (₹).
Strictly free of post-return leakage variables.
"""

import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import (
    RANDOM_SEED,
    CATEGORY_RETURN_BASELINES,
    PAYMENT_RETURN_MULTIPLIERS,
    ALL_INPUT_FEATURES,
    TARGET_VARIABLE
)

def generate_orders_dataset(num_orders=15000, output_path=None):
    np.random.seed(RANDOM_SEED)
    
    # 1. Customer Base
    num_customers = int(num_orders * 0.45)
    customer_ids = [f"CUST-{1000 + i}" for i in range(num_customers)]
    
    # Customer underlying propensities (Beta distribution for realistic skew)
    cust_return_propensities = np.random.beta(a=2, b=8, size=num_customers) # mean ~0.20
    # Customer baseline order values in INR (Lognormal)
    cust_mean_aov = np.random.lognormal(mean=7.8, sigma=0.6, size=num_customers) # mean ~₹3,000 - ₹8,000
    cust_mean_aov = np.clip(cust_mean_aov, 500, 35000)
    
    customer_profiles = {
        cid: {
            "propensity": cust_return_propensities[i],
            "aov": cust_mean_aov[i],
            "orders": 0,
            "returns": 0,
            "cancels": 0
        }
        for i, cid in enumerate(customer_ids)
    }

    # Categories and Payment distributions
    categories = list(CATEGORY_RETURN_BASELINES.keys())
    cat_weights = [0.35, 0.22, 0.18, 0.12, 0.08, 0.05]
    
    payment_methods = list(PAYMENT_RETURN_MULTIPLIERS.keys())
    payment_weights = [0.28, 0.25, 0.18, 0.22, 0.07] # COD is 28% in Indian e-commerce
    
    delivery_types = ["Standard", "Express", "Same Day"]
    delivery_weights = [0.70, 0.22, 0.08]

    start_date = datetime(2025, 9, 1)
    
    records = []
    
    for order_idx in range(num_orders):
        order_id = f"ORD-{10001 + order_idx}"
        
        # Pick customer
        cid = np.random.choice(customer_ids)
        cprofile = customer_profiles[cid]
        
        # Customer historical stats at time of this order
        c_order_count = cprofile["orders"]
        c_prev_returns = cprofile["returns"]
        c_prev_cancels = cprofile["cancels"]
        is_first_time = 1 if c_order_count == 0 else 0
        
        c_hist_return_rate = (c_prev_returns / c_order_count) if c_order_count > 0 else float(cprofile["propensity"])
        c_avg_order_value = float(cprofile["aov"])
        
        # Category & Product
        cat = np.random.choice(categories, p=cat_weights)
        cat_base_rate = CATEGORY_RETURN_BASELINES[cat]
        prod_id = f"PROD-{cat[:3].upper()}-{np.random.randint(100, 999)}"
        prod_hist_rate = np.clip(np.random.normal(loc=cat_base_rate, scale=0.04), 0.02, 0.65)
        
        # Order Value in INR
        # Deviation factor: how much current order differs from customer's average AOV
        val_multiplier = np.random.lognormal(mean=0.0, sigma=0.45)
        order_value = float(np.round(c_avg_order_value * val_multiplier, -1))
        order_value = max(399.0, min(order_value, 75000.0))
        val_deviation = float((order_value - c_avg_order_value) / c_avg_order_value)
        
        # Payment & Delivery
        payment = np.random.choice(payment_methods, p=payment_weights)
        pay_multiplier = PAYMENT_RETURN_MULTIPLIERS[payment]
        
        delivery = np.random.choice(delivery_types, p=delivery_weights)
        
        # Delivery delay (in days): Express usually 0, Standard 0-5 days
        delay_prob = 0.25 if delivery == "Standard" else 0.10
        delay_days = int(np.random.exponential(scale=2.0)) if np.random.rand() < delay_prob else 0
        delay_days = min(delay_days, 12)
        
        # Items and Multi-size bracket purchasing
        # Bracket buying is common in Apparel & Footwear
        if cat in ["Apparel", "Footwear"]:
            num_items = int(np.random.choice([1, 2, 3, 4], p=[0.50, 0.32, 0.12, 0.06]))
            is_multi_size = 1 if (num_items >= 2 and np.random.rand() < 0.38) else 0
        else:
            num_items = int(np.random.choice([1, 2, 3], p=[0.75, 0.20, 0.05]))
            is_multi_size = 0
            
        discount_pct = float(np.random.choice([0, 10, 15, 20, 30, 40, 50], p=[0.30, 0.20, 0.15, 0.15, 0.10, 0.06, 0.04]))
        
        # Date progression (spread over 360 days)
        day_offset = int((order_idx / num_orders) * 350) + np.random.randint(-3, 4)
        day_offset = max(0, min(day_offset, 360))
        order_date = (start_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        
        # Latent Return Propensity (Logistic Model on ground truth factors)
        # Higher score -> higher likelihood that customer returns this order
        logit = (
            -2.60
            + 2.80 * (c_hist_return_rate - 0.20)
            + 1.85 * (prod_hist_rate - 0.18)
            + 1.40 * is_multi_size                  # Bracket buying is a huge indicator
            + 0.55 * np.log1p(max(0, val_deviation)) # Buying unusually expensive items
            + 0.45 * (1 if payment == "COD" else 0) # COD has higher buyer remorse
            + 0.12 * delay_days                     # Long delivery delays increase return risk
            + 0.08 * (num_items - 1)
            + 0.015 * (discount_pct / 10.0)
            + np.random.normal(0, 0.45)             # Unobserved noise
        )
        
        return_prob = 1.0 / (1.0 + np.exp(-logit))
        returned = 1 if np.random.rand() < return_prob else 0
        
        # Update customer profile history for future orders
        cprofile["orders"] += 1
        if returned:
            cprofile["returns"] += 1
        if not returned and np.random.rand() < 0.04:
            cprofile["cancels"] += 1
            
        records.append({
            "order_id": order_id,
            "customer_id": cid,
            "order_date": order_date,
            "product_id": prod_id,
            "product_category": cat,
            "order_value": order_value,
            "payment_method": payment,
            "delivery_type": delivery,
            "delivery_delay_days": delay_days,
            "number_of_items": num_items,
            "is_multi_size_order": is_multi_size,
            "customer_order_count": c_order_count,
            "customer_previous_return_count": c_prev_returns,
            "customer_previous_cancel_count": c_prev_cancels,
            "customer_historical_return_rate": round(c_hist_return_rate, 4),
            "customer_avg_order_value": round(c_avg_order_value, 2),
            "order_value_deviation": round(val_deviation, 4),
            "product_historical_return_rate": round(prod_hist_rate, 4),
            "category_historical_return_rate": round(cat_base_rate, 4),
            "discount_percent": discount_pct,
            "is_first_time_customer": is_first_time,
            "target_returned": returned
        })
        
    df = pd.DataFrame(records)
    
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Dataset generated with {len(df)} records saved to {output_path}")
        print(f"Return Rate: {df['target_returned'].mean():.2%}")
        
    return df

if __name__ == "__main__":
    out = os.path.abspath(os.path.join(os.path.dirname(__file__), 'orders_return_dataset.csv'))
    generate_orders_dataset(num_orders=15000, output_path=out)
