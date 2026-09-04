"""
Evaluation Suite for AI Return-Risk Models.
Computes Classification Metrics, Confusion Matrices, ROC-AUC, and Business Friction Costs.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

def evaluate_model(model, X_test, y_test, model_name="Model", test_order_values=None):
    """
    Computes comprehensive evaluation metrics for a trained return-risk model.
    """
    # Predict probabilities and classes
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= 0.50).astype(int)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_prob)
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    # Calculate False Positive Rate
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    
    # Business metric: Estimated false positive review friction cost in INR
    # Assume ₹50 verification/handling cost per false positive review
    fp_cost = int(fp * 50)
    
    # Estimated revenue saved: sum of order values for correctly caught high-risk returns (TP)
    # vs missed revenue (FN)
    if test_order_values is not None and len(test_order_values) == len(y_test):
        caught_revenue_at_risk = float(test_order_values[y_test == 1][y_pred[y_test == 1] == 1].sum())
        missed_revenue_at_risk = float(test_order_values[y_test == 1][y_pred[y_test == 1] == 0].sum())
    else:
        caught_revenue_at_risk = 0.0
        missed_revenue_at_risk = 0.0
        
    metrics = {
        "model_name": model_name,
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(auc), 4),
        "false_positive_rate": round(float(fpr), 4),
        "confusion_matrix": {
            "true_positive": int(tp),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_negative": int(tn)
        },
        "est_fp_cost_inr": fp_cost,
        "caught_revenue_inr": round(caught_revenue_at_risk, 2),
        "missed_revenue_inr": round(missed_revenue_at_risk, 2)
    }
    
    return metrics

def print_evaluation_summary(metrics):
    print(f"\n=======================================================")
    print(f"  EVALUATION RESULTS: {metrics['model_name']}")
    print(f"=======================================================")
    print(f"  Accuracy:            {metrics['accuracy'] * 100:.2f}%")
    print(f"  Precision (Returns): {metrics['precision'] * 100:.2f}%")
    print(f"  Recall (Returns):    {metrics['recall'] * 100:.2f}% (Critical for return prevention)")
    print(f"  F1 Score:            {metrics['f1_score'] * 100:.2f}%")
    print(f"  ROC-AUC:             {metrics['roc_auc']:.4f}")
    print(f"  False Positive Rate: {metrics['false_positive_rate'] * 100:.2f}%")
    print(f"  Est. FP Review Cost: INR {metrics['est_fp_cost_inr']:,}")
    print(f"-------------------------------------------------------")
    cm = metrics['confusion_matrix']
    print(f"  Confusion Matrix:")
    print(f"    TP: {cm['true_positive']:<6} | FP: {cm['false_positive']}")
    print(f"    FN: {cm['false_negative']:<6} | TN: {cm['true_negative']}")
    print(f"=======================================================\n")
