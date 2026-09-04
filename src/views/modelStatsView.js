import { store, formatINR } from '../state/store.js';

export function renderModelStatsView(container) {
  const stats = store.modelStats;
  const cm = stats.confusionMatrix;

  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-container-max mx-auto">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800">ACTIVE TRAINED MODEL</span>
            <span class="text-xs text-on-surface-variant">• ${stats.modelName}</span>
          </div>
          <h2 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">AI Return-Risk Model Performance</h2>
          <p class="font-body-lg text-sm text-on-surface-variant">Diagnostic evaluations, confusion matrix, and feature attribution for predictive model ${stats.modelVersion}.</p>
        </div>
        <div class="flex items-center gap-4 text-xs font-mono">
          <div class="flex flex-col items-end">
            <span class="text-on-surface-variant uppercase text-[10px]">Training Dataset</span>
            <span class="font-bold text-on-surface">${stats.trainingDatasetSize}</span>
          </div>
          <div class="w-[1px] h-8 bg-outline-variant"></div>
          <div class="flex flex-col items-end">
            <span class="text-on-surface-variant uppercase text-[10px]">Test Validation Size</span>
            <span class="font-bold text-primary">${stats.testDatasetSize}</span>
          </div>
        </div>
      </div>

      <!-- Performance KPIs (Bento Grid) -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <!-- Accuracy -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span class="font-label-md text-xs text-on-surface-variant uppercase font-semibold">Accuracy</span>
          </div>
          <div class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">${stats.accuracy}</div>
          <span class="text-[11px] text-on-surface-variant mt-1">Cross-entropy test metric</span>
        </div>

        <!-- Precision -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="material-symbols-outlined text-primary text-[18px]">rule</span>
            <span class="font-label-md text-xs text-on-surface-variant uppercase font-semibold">Precision</span>
          </div>
          <div class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">${stats.precision}</div>
          <span class="text-[11px] text-emerald-600 font-medium mt-1">Class 1 return precision</span>
        </div>

        <!-- Recall -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="material-symbols-outlined text-primary text-[18px]">functions</span>
            <span class="font-label-md text-xs text-on-surface-variant uppercase font-semibold">Recall</span>
          </div>
          <div class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">${stats.recall}</div>
          <span class="text-[11px] text-on-surface-variant mt-1">Captures true returns</span>
        </div>

        <!-- ROC-AUC / F1 -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="material-symbols-outlined text-indigo-600 text-[18px]">analytics</span>
            <span class="font-label-md text-xs text-on-surface-variant uppercase font-semibold">ROC-AUC / F1</span>
          </div>
          <div class="font-display-lg text-2xl md:text-3xl font-bold text-indigo-600">${stats.rocAuc || stats.f1Score}</div>
          <span class="text-[11px] text-on-surface-variant mt-1">F1 Score: ${stats.f1Score}</span>
        </div>

        <!-- FP Cost in INR -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="material-symbols-outlined text-amber-600 text-[18px]">payments</span>
            <span class="font-label-md text-xs text-on-surface-variant uppercase font-semibold">Est. FP Cost (₹)</span>
          </div>
          <div class="font-display-lg text-2xl md:text-3xl font-bold text-amber-600">${formatINR(stats.estFalsePositiveCost)}</div>
          <span class="text-[11px] text-on-surface-variant mt-1">Reviewer overhead cost</span>
        </div>
      </div>

      <!-- Complex Analysis: Confusion Matrix & Feature Importance -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Confusion Matrix (6 cols) -->
        <div class="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm border-l-4 border-l-primary flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-headline-sm text-base font-bold text-on-surface">Test Set Confusion Matrix</h3>
              <span class="text-xs font-mono bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">${stats.testDatasetSize}</span>
            </div>
            <p class="font-body-md text-xs text-on-surface-variant mb-4">Evaluating actual order outcomes vs AI model predicted return propensity.</p>

            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div></div>
              <div class="font-semibold text-on-surface-variant py-1 bg-surface rounded">Predicted Return</div>
              <div class="font-semibold text-on-surface-variant py-1 bg-surface rounded">Predicted Kept</div>

              <!-- Actual Return Row -->
              <div class="font-semibold text-on-surface-variant flex items-center justify-end pr-2">Actual Return</div>
              <div class="bg-emerald-100 text-emerald-900 p-3 rounded-lg flex flex-col justify-center items-center">
                <span class="font-mono text-lg font-bold">${cm.truePositive.toLocaleString('en-IN')}</span>
                <span class="text-[10px] font-semibold text-emerald-700 uppercase">True Positive (TP)</span>
              </div>
              <div class="bg-red-50 text-red-900 p-3 rounded-lg flex flex-col justify-center items-center">
                <span class="font-mono text-lg font-bold">${cm.falseNegative.toLocaleString('en-IN')}</span>
                <span class="text-[10px] font-semibold text-red-700 uppercase">False Negative (FN)</span>
              </div>

              <!-- Actual Kept Row -->
              <div class="font-semibold text-on-surface-variant flex items-center justify-end pr-2">Actual Kept</div>
              <div class="bg-amber-50 text-amber-900 p-3 rounded-lg flex flex-col justify-center items-center">
                <span class="font-mono text-lg font-bold">${cm.falsePositive.toLocaleString('en-IN')}</span>
                <span class="text-[10px] font-semibold text-amber-700 uppercase">False Positive (FP)</span>
              </div>
              <div class="bg-surface-container text-on-surface p-3 rounded-lg flex flex-col justify-center items-center">
                <span class="font-mono text-lg font-bold">${cm.trueNegative.toLocaleString('en-IN')}</span>
                <span class="text-[10px] font-semibold text-on-surface-variant uppercase">True Negative (TN)</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-outline-variant text-[11px] text-on-surface-variant flex justify-between">
            <span>F1-Score: <strong>${stats.f1Score}</strong></span>
            <span>False Positive Rate: <strong>${stats.falsePositiveRate}</strong></span>
          </div>
        </div>

        <!-- Global Feature Importance (6 cols) -->
        <div class="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-headline-sm text-base font-bold text-on-surface">Global Feature Importance (SHAP Values)</h3>
              <span class="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
            </div>
            <p class="font-body-md text-xs text-on-surface-variant mb-4">Relative predictive weight of input features in the XGBoost tree ensemble.</p>

            <div class="flex flex-col gap-3">
              ${stats.featureImportance.map(f => {
                const pct = Math.round(f.score * 100);
                return `
                  <div class="flex flex-col gap-1">
                    <div class="flex justify-between items-center text-xs">
                      <span class="font-medium text-on-surface">${f.feature}</span>
                      <span class="font-mono font-bold text-primary">${pct}%</span>
                    </div>
                    <div class="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                      <div class="bg-primary h-full rounded-full" style="width: ${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-outline-variant text-[11px] text-on-surface-variant">
            Top driver: <strong>Customer 12-Month Return Rate</strong> accounts for 34% of overall split gain.
          </div>
        </div>
      </div>
    </div>
  `;
}
