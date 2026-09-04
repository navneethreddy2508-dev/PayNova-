"""
Model Training and Comparison Pipeline for AI Return-Risk Scorer.
Trains Baseline (Logistic Regression) vs Tree Ensemble (Random Forest & GBDT).
Selects and serializes the champion model along with evaluation metadata.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier

try:
    from ml.config import (
        MODEL_NAME,
        MODEL_VERSION,
        DATASET_VERSION,
        RANDOM_SEED,
        ALL_INPUT_FEATURES
    )
    from ml.src.preprocessing import load_and_split_data, build_preprocessor
    from ml.src.evaluate import evaluate_model, print_evaluation_summary
except ImportError:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from config import (
        MODEL_NAME,
        MODEL_VERSION,
        DATASET_VERSION,
        RANDOM_SEED,
        ALL_INPUT_FEATURES
    )
    from src.preprocessing import load_and_split_data, build_preprocessor
    from src.evaluate import evaluate_model, print_evaluation_summary

def run_training_pipeline(dataset_path=None, models_dir=None):
    if dataset_path is None:
        dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'orders_return_dataset.csv'))
        
    if models_dir is None:
        models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models'))
    os.makedirs(models_dir, exist_ok=True)

    # 1. Ensure dataset exists
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}. Generating synthetic dataset...")
        from data.generate_dataset import generate_orders_dataset
        generate_orders_dataset(num_orders=15000, output_path=dataset_path)

    # 2. Load and Split (Time-aware split prevents lookahead leakage)
    print("\n--- 1. Loading and Splitting Data ---")
    X_train, X_test, y_train, y_test, train_df, test_df = load_and_split_data(dataset_path, test_size=0.20, time_aware_split=True)
    
    print(f"Training Set: {len(X_train)} orders (Return Rate: {y_train.mean():.2%})")
    print(f"Test Set:     {len(X_test)} orders (Return Rate: {y_test.mean():.2%})")

    # 3. Build Preprocessor
    preprocessor = build_preprocessor()

    # 4. Define Candidate Models
    models = {
        "Logistic Regression (Baseline)": LogisticRegression(
            class_weight='balanced',
            max_iter=1000,
            random_state=RANDOM_SEED
        ),
        "Random Forest Classifier": RandomForestClassifier(
            n_estimators=150,
            max_depth=12,
            min_samples_split=6,
            class_weight='balanced',
            random_state=RANDOM_SEED,
            n_jobs=-1
        ),
        "HistGradientBoosting Classifier": HistGradientBoostingClassifier(
            max_iter=150,
            max_depth=8,
            min_samples_leaf=15,
            class_weight='balanced',
            random_state=RANDOM_SEED
        )
    }

    test_order_values = test_df["order_value"].values
    results = {}
    fitted_pipelines = {}

    print("\n--- 2. Training and Evaluating Models ---")
    for name, clf in models.items():
        print(f"\nTraining {name}...")
        pipe = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])
        
        # Fit on training data ONLY
        pipe.fit(X_train, y_train)
        fitted_pipelines[name] = pipe
        
        # Evaluate on test set
        metrics = evaluate_model(pipe, X_test, y_test, model_name=name, test_order_values=test_order_values)
        results[name] = metrics
        print_evaluation_summary(metrics)

    # 5. Model Selection (Selecting champion based on F1 Score and ROC-AUC)
    # Random Forest / Gradient Boosting typically outperforms Logistic Regression
    champion_name = max(results.keys(), key=lambda k: results[k]["f1_score"])
    champion_pipe = fitted_pipelines[champion_name]
    champion_metrics = results[champion_name]
    
    print(f"\n=======================================================")
    print(f"  CHAMPION MODEL SELECTED: {champion_name}")
    print(f"  F1 Score: {champion_metrics['f1_score'] * 100:.2f}% | ROC-AUC: {champion_metrics['roc_auc']:.4f}")
    print(f"=======================================================")

    # 6. Extract Feature Importances from Champion Model
    clf_step = champion_pipe.named_steps['classifier']
    prep_step = champion_pipe.named_steps['preprocessor']
    feature_names = prep_step.get_feature_names_out().tolist()
    
    feature_importances = []
    if hasattr(clf_step, 'feature_importances_'):
        raw_importances = clf_step.feature_importances_
        # Group one-hot encoded categories back to main features or list individually
        for fname, imp in sorted(zip(feature_names, raw_importances), key=lambda x: x[1], reverse=True):
            feature_importances.append({
                "feature": fname,
                "importance": round(float(imp), 4)
            })
    elif hasattr(clf_step, 'coef_'):
        raw_coefs = np.abs(clf_step.coef_[0])
        norm_coefs = raw_coefs / np.sum(raw_coefs)
        for fname, imp in sorted(zip(feature_names, norm_coefs), key=lambda x: x[1], reverse=True):
            feature_importances.append({
                "feature": fname,
                "importance": round(float(imp), 4)
            })

    # 7. Serialize Artifacts
    model_artifact_path = os.path.join(models_dir, "best_model.joblib")
    joblib.dump(champion_pipe, model_artifact_path)
    print(f"\nChampion model pipeline serialized to: {model_artifact_path}")

    # Metadata for frontend and documentation
    metadata = {
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "champion_algorithm": champion_name,
        "dataset_version": DATASET_VERSION,
        "total_records": len(train_df) + len(test_df),
        "train_records": len(train_df),
        "test_records": len(test_df),
        "features_used": ALL_INPUT_FEATURES,
        "engineered_feature_count": len(feature_names),
        "champion_metrics": champion_metrics,
        "all_model_comparison": results,
        "top_feature_importances": feature_importances[:10]
    }

    metadata_path = os.path.join(models_dir, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Model metadata exported to: {metadata_path}")

    return champion_pipe, metadata

if __name__ == "__main__":
    run_training_pipeline()
