"""
Data Preprocessing and Featurization Pipeline.
Strictly avoids target leakage and test-set contamination.
"""

import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

try:
    from ml.config import (
        NUMERICAL_FEATURES,
        CATEGORICAL_FEATURES,
        BINARY_FEATURES,
        ALL_INPUT_FEATURES,
        TARGET_VARIABLE,
        RANDOM_SEED
    )
except ImportError:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from config import (
        NUMERICAL_FEATURES,
        CATEGORICAL_FEATURES,
        BINARY_FEATURES,
        ALL_INPUT_FEATURES,
        TARGET_VARIABLE,
        RANDOM_SEED
    )

def load_and_split_data(data_path, test_size=0.20, time_aware_split=True):
    """
    Loads dataset and splits into Train and Test sets.
    Uses time-aware split if date is available, ensuring realistic chronological evaluation.
    """
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")
        
    df = pd.read_csv(data_path)
    
    # Verify required columns
    required_cols = ALL_INPUT_FEATURES + [TARGET_VARIABLE]
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns in dataset: {missing_cols}")
        
    # Check for missing values and report
    null_counts = df[required_cols].isnull().sum()
    if null_counts.any():
        print("Handling missing values:")
        print(null_counts[null_counts > 0])
        
    if time_aware_split and "order_date" in df.columns:
        # Time-aware split: sort by order_date, earliest 80% train, latest 20% test
        df_sorted = df.sort_values(by="order_date").reset_index(drop=True)
        split_idx = int(len(df_sorted) * (1 - test_size))
        
        train_df = df_sorted.iloc[:split_idx].copy()
        test_df = df_sorted.iloc[split_idx:].copy()
        print(f"Time-aware split performed: Train {len(train_df)} rows ({train_df['order_date'].min()} to {train_df['order_date'].max()}), "
              f"Test {len(test_df)} rows ({test_df['order_date'].min()} to {test_df['order_date'].max()})")
    else:
        # Stratified random split
        train_df, test_df = train_test_split(
            df,
            test_size=test_size,
            random_state=RANDOM_SEED,
            stratify=df[TARGET_VARIABLE]
        )
        print(f"Stratified random split performed: Train {len(train_df)} rows, Test {len(test_df)} rows")
        
    X_train = train_df[ALL_INPUT_FEATURES].copy()
    y_train = train_df[TARGET_VARIABLE].copy()
    
    X_test = test_df[ALL_INPUT_FEATURES].copy()
    y_test = test_df[TARGET_VARIABLE].copy()
    
    return X_train, X_test, y_train, y_test, train_df, test_df

def build_preprocessor():
    """
    Constructs a ColumnTransformer pipeline that scales numerical variables
    and one-hot encodes categorical variables safely.
    """
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    binary_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value=0))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, NUMERICAL_FEATURES),
            ('cat', categorical_transformer, CATEGORICAL_FEATURES),
            ('bin', binary_transformer, BINARY_FEATURES)
        ],
        remainder='drop',
        verbose_feature_names_out=False
    )
    
    return preprocessor

if __name__ == "__main__":
    data_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'orders_return_dataset.csv'))
    if os.path.exists(data_file):
        X_train, X_test, y_train, y_test, _, _ = load_and_split_data(data_file)
        prep = build_preprocessor()
        X_train_trans = prep.fit_transform(X_train)
        print(f"Transformed X_train shape: {X_train_trans.shape}")
        print("Feature Names:", prep.get_feature_names_out())
