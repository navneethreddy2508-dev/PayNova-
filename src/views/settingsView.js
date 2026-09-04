import { store } from '../state/store.js';

export function renderSettingsView(container) {
  const settings = store.settings;

  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-container-max mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <p class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Configuration</p>
          <h2 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">Return-Risk Engine Settings</h2>
          <p class="font-body-lg text-sm text-on-surface-variant">Calibrate predictive scoring cutoffs, alert triggers, and institutional inference parameters.</p>
        </div>
        <button id="btn-save-settings" class="px-4 py-2 bg-primary text-on-primary hover:bg-primary-container font-label-md text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
          <span class="material-symbols-outlined text-[16px]">save</span>
          <span>Save Changes</span>
        </button>
      </div>

      <!-- Settings Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <!-- Left Column: Risk Thresholds (8 cols) -->
        <div class="md:col-span-8 flex flex-col gap-5">
          <!-- Threshold Configuration -->
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <h3 class="font-headline-sm text-base font-bold text-on-surface mb-1 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">tune</span>
              <span>Risk Threshold Calibration</span>
            </h3>
            <p class="text-xs text-on-surface-variant mb-5">Adjust the probability thresholds that classify orders into High, Medium, or Low return risk tiers.</p>

            <div class="flex flex-col gap-5">
              <!-- High Risk Threshold -->
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center text-xs font-semibold">
                  <span class="text-red-700 flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-red-600"></span> High Risk Cutoff
                  </span>
                  <span id="label-high-threshold" class="font-mono text-sm font-bold text-red-600">&gt; ${settings.highRiskThreshold}%</span>
                </div>
                <input 
                  id="range-high-threshold"
                  type="range" 
                  min="50" 
                  max="95" 
                  value="${settings.highRiskThreshold}" 
                  class="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <span class="text-[11px] text-on-surface-variant">Orders with predicted probability above this value are tagged as HIGH risk and escalated for merchant action.</span>
              </div>

              <!-- Medium Risk Threshold -->
              <div class="flex flex-col gap-2 pt-3 border-t border-outline-variant/60">
                <div class="flex justify-between items-center text-xs font-semibold">
                  <span class="text-amber-700 flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span> Medium Risk Cutoff
                  </span>
                  <span id="label-medium-threshold" class="font-mono text-sm font-bold text-amber-600">&gt; ${settings.mediumRiskThreshold}%</span>
                </div>
                <input 
                  id="range-medium-threshold"
                  type="range" 
                  min="20" 
                  max="65" 
                  value="${settings.mediumRiskThreshold}" 
                  class="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span class="text-[11px] text-on-surface-variant">Orders with predicted probability between this and the High Risk cutoff are marked as MEDIUM risk.</span>
              </div>
            </div>
          </div>

          <!-- Alert Preferences -->
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <h3 class="font-headline-sm text-base font-bold text-on-surface mb-1 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
              <span>Notification &amp; Escalation Preferences</span>
            </h3>
            <p class="text-xs text-on-surface-variant mb-4">Configure automatic alerts for high-exposure orders.</p>

            <div class="flex flex-col gap-3 text-xs">
              <label class="flex items-center justify-between p-3 bg-surface rounded-lg border border-outline-variant cursor-pointer">
                <div>
                  <div class="font-semibold text-on-surface">Email alerts for High Risk orders (&gt; ₹10,000 value)</div>
                  <div class="text-on-surface-variant text-[11px]">Send immediate notification to risk analyst team.</div>
                </div>
                <input type="checkbox" checked class="w-4 h-4 rounded text-primary focus:ring-primary"/>
              </label>

              <label class="flex items-center justify-between p-3 bg-surface rounded-lg border border-outline-variant cursor-pointer">
                <div>
                  <div class="font-semibold text-on-surface">Model drift anomaly alerts</div>
                  <div class="text-on-surface-variant text-[11px]">Notify when PSI exceeds 0.02 threshold.</div>
                </div>
                <input type="checkbox" checked class="w-4 h-4 rounded text-primary focus:ring-primary"/>
              </label>
            </div>
          </div>
        </div>

        <!-- Right Column: Model & Account Info (4 cols) -->
        <div class="md:col-span-4 flex flex-col gap-5">
          <!-- Active Engine Info -->
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <h3 class="font-headline-sm text-base font-bold text-on-surface mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
              <span>Active Inference Engine</span>
            </h3>
            <div class="flex flex-col gap-2 text-xs font-body-md">
              <div class="p-2.5 bg-surface rounded border border-outline-variant font-mono">
                <span class="text-primary font-bold block">${settings.activeEngine}</span>
                <span class="text-on-surface-variant text-[11px]">Random Forest Champion Ensemble</span>
              </div>
              <div class="flex justify-between py-1 border-b border-surface-variant">
                <span class="text-on-surface-variant">Primary Currency:</span>
                <span class="font-bold text-on-surface">INR (₹)</span>
              </div>
              <div class="flex justify-between py-1 border-b border-surface-variant">
                <span class="text-on-surface-variant">Inference Latency:</span>
                <span class="font-mono text-on-surface">14ms / order</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-on-surface-variant">Status:</span>
                <span class="text-emerald-600 font-bold">Online &amp; Active</span>
              </div>
            </div>
          </div>

          <!-- Analyst Profile -->
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <h3 class="font-headline-sm text-base font-bold text-on-surface mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">account_circle</span>
              <span>Reviewer Profile</span>
            </h3>
            <div class="flex items-center gap-3 mb-3">
              <img src="${store.currentUser.avatar}" class="w-10 h-10 rounded-full object-cover border border-outline-variant" alt="${store.currentUser.name}"/>
              <div>
                <div class="font-bold text-xs text-on-surface">${store.currentUser.name}</div>
                <div class="text-[11px] text-on-surface-variant">${store.currentUser.role}</div>
              </div>
            </div>
            <div class="text-[11px] text-on-surface-variant font-mono p-2 bg-surface rounded border border-outline-variant">
              ${store.currentUser.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Range listeners
  const rangeHigh = container.querySelector('#range-high-threshold');
  const labelHigh = container.querySelector('#label-high-threshold');
  if (rangeHigh && labelHigh) {
    rangeHigh.addEventListener('input', (e) => {
      labelHigh.innerText = `> ${e.target.value}%`;
    });
  }

  const rangeMed = container.querySelector('#range-medium-threshold');
  const labelMed = container.querySelector('#label-medium-threshold');
  if (rangeMed && labelMed) {
    rangeMed.addEventListener('input', (e) => {
      labelMed.innerText = `> ${e.target.value}%`;
    });
  }

  const btnSave = container.querySelector('#btn-save-settings');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      store.updateSettings({
        highRiskThreshold: parseInt(rangeHigh.value),
        mediumRiskThreshold: parseInt(rangeMed.value)
      });
      alert("Return-Risk settings updated successfully!");
    });
  }
}
