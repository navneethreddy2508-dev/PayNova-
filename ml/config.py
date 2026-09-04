"""
Centralized Configuration for AI Return-Risk Scorer ML Pipeline.
"""

# Model Metadata
MODEL_NAME = "ReturnGuard-Ensemble"
MODEL_VERSION = "order-return-risk-model-v1.0"
DATASET_VERSION = "synthetic-ecommerce-orders-v1.0"
RANDOM_SEED = 42

# Centralized Risk Thresholds (Probabilities 0.0 to 1.0)
RISK_THRESHOLDS = {
    "LOW_MAX": 0.39,      # 0% - 39% -> LOW
    "MEDIUM_MAX": 0.69,   # 40% - 69% -> MEDIUM
    "HIGH_MIN": 0.70      # 70% - 100% -> HIGH
}

# Feature Categories
NUMERICAL_FEATURES = [
    "order_value",
    "delivery_delay_days",
    "number_of_items",
    "customer_order_count",
    "customer_previous_return_count",
    "customer_previous_cancel_count",
    "customer_historical_return_rate",
    "customer_avg_order_value",
    "order_value_deviation",
    "product_historical_return_rate",
    "category_historical_return_rate",
    "discount_percent"
]

CATEGORICAL_FEATURES = [
    "product_category",
    "payment_method",
    "delivery_type"
]

BINARY_FEATURES = [
    "is_multi_size_order",
    "is_first_time_customer"
]

ALL_INPUT_FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES

TARGET_VARIABLE = "target_returned"

# Category Baselines for dataset generation
CATEGORY_RETURN_BASELINES = {
    "Apparel": 0.30,
    "Footwear": 0.26,
    "Electronics": 0.16,
    "Furniture & Home": 0.12,
    "Personal Care": 0.07,
    "Jewelry": 0.10
}

PAYMENT_RETURN_MULTIPLIERS = {
    "COD": 1.65,             # Cash On Delivery has significantly higher return/RTO rate
    "Credit Card": 0.85,
    "Debit Card": 0.95,
    "UPI": 1.00,
    "Netbanking": 0.90
}
