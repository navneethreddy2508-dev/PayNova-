import { store, formatINR, formatCompactINR } from '../state/store.js';

export function renderAnalyticsView(container) {
  const analytics = store.analytics;
  const categories = analytics.categoryBreakdown;

  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-container-max mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <p class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Institutional Insights</p>
          <h2 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">Return Analytics &amp; Loss Recovery</h2>
          <p class="font-body-lg text-sm text-on-surface-variant">Deep-dive trends across merchandise categories, customer segments, and sizing anomalies.</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-mono text-on-surface font-semibold">
            Monitored: ${formatCompactINR(analytics.kpis.totalRevenueMonitored)} GMV
          </span>
        </div>
      </div>

      <!-- Top Summary KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <span class="text-xs text-on-surface-variant uppercase font-semibold block mb-1">Total Revenue at Risk</span>
          <div class="font-display-lg text-2xl md:text-3xl font-bold text-red-600">${formatCompactINR(analytics.kpis.totalRevenueAtRisk)}</div>
          <span class="text-xs text-on-surface-variant mt-1 block">Calculated across 312 predicted returns</span>
        </div>

        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <span class="text-xs text-on-surface-variant uppercase font-semibold block mb-1">Actual Revenue Recovered</span>
          <div class="font-display-lg text-2xl md:text-3xl font-bold text-emerald-600">${formatCompactINR(analytics.kpis.actualRevenueRecovered)}</div>
          <span class="text-xs text-emerald-700 mt-1 block">Via merchant sizing/address verifications</span>
        </div>

        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <span class="text-xs text-on-surface-variant uppercase font-semibold block mb-1">Average Return Probability</span>
          <div class="font-display-lg text-2xl md:text-3xl font-bold text-primary">${analytics.kpis.avgReturnProbability}</div>
          <span class="text-xs text-on-surface-variant mt-1 block">Across all active catalog categories</span>
        </div>
      </div>

      <!-- Category Return Rates Table & Breakdown -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div class="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <h3 class="font-headline-sm text-base font-bold text-on-surface">Category-Wise Return Risk Breakdown</h3>
            <p class="text-xs text-on-surface-variant">Comparative return rate &amp; revenue exposure across product departments.</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-lowest border-b border-outline-variant font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
                <th class="p-4 font-semibold">Category</th>
                <th class="p-4 font-semibold">Order Volume</th>
                <th class="p-4 font-semibold">Historical Return Rate</th>
                <th class="p-4 font-semibold">Revenue at Risk (₹)</th>
                <th class="p-4 font-semibold">Primary Return Driver</th>
              </tr>
            </thead>
            <tbody class="font-body-md text-sm text-on-surface divide-y divide-outline-variant/60">
              ${categories.map(cat => `
                <tr class="hover:bg-surface-container-low transition-colors">
                  <td class="p-4 font-semibold text-on-surface">
                    ${cat.category}
                  </td>
                  <td class="p-4 font-mono-data">
                    ${cat.orderVolume.toLocaleString('en-IN')} orders
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold ${cat.returnRate > 20 ? 'text-red-600' : (cat.returnRate > 10 ? 'text-amber-600' : 'text-emerald-600')}">
                        ${cat.returnRate}%
                      </span>
                      <div class="w-20 bg-surface-variant h-1.5 rounded-full overflow-hidden">
                        <div class="${cat.returnRate > 20 ? 'bg-red-500' : (cat.returnRate > 10 ? 'bg-amber-500' : 'bg-emerald-500')} h-full rounded-full" style="width: ${cat.returnRate * 2.5}%"></div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 font-mono-data font-semibold text-on-surface">
                    ${formatINR(cat.revenueAtRisk)}
                  </td>
                  <td class="p-4 text-xs text-on-surface-variant">
                    ${cat.topReason}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Behavioral Analysis Cards (From Customer & Product Stitch screens) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Customer Return Behavior Patterns -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-outline-variant">
            <span class="material-symbols-outlined text-primary text-[22px]">psychology</span>
            <h3 class="font-headline-sm text-base font-bold text-on-surface">Top Return-Risk Behavioral Archetypes</h3>
          </div>
          <div class="flex flex-col gap-3 text-xs">
            <div class="p-3 bg-surface rounded-lg border border-outline-variant/60">
              <div class="flex justify-between font-bold text-on-surface mb-1">
                <span>1. Bracket Purchasing (Multi-Size Buying)</span>
                <span class="text-red-600 font-mono">92% Return Rate</span>
              </div>
              <p class="text-on-surface-variant leading-relaxed">Customers purchasing multiple adjacent sizes of the same SKU with the express intent of keeping only one.</p>
            </div>
            <div class="p-3 bg-surface rounded-lg border border-outline-variant/60">
              <div class="flex justify-between font-bold text-on-surface mb-1">
                <span>2. Wardrobing / Occasion Wear Returns</span>
                <span class="text-red-600 font-mono">84% Return Rate</span>
              </div>
              <p class="text-on-surface-variant leading-relaxed">High-ticket evening/ethnic apparel ordered on COD, worn once, and returned within the 7-day window.</p>
            </div>
            <div class="p-3 bg-surface rounded-lg border border-outline-variant/60">
              <div class="flex justify-between font-bold text-on-surface mb-1">
                <span>3. Buyer's Remorse on Premium Electronics</span>
                <span class="text-amber-600 font-mono">48% Return Rate</span>
              </div>
              <p class="text-on-surface-variant leading-relaxed">Orders with values exceeding 3x the customer's average historical order value.</p>
            </div>
          </div>
        </div>

        <!-- Delivery & Operational Correlation -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-outline-variant">
            <span class="material-symbols-outlined text-primary text-[22px]">local_shipping</span>
            <h3 class="font-headline-sm text-base font-bold text-on-surface">Logistics Impact on Return Probability</h3>
          </div>
          <div class="flex flex-col gap-3 text-xs">
            <div class="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-outline-variant/60">
              <span class="text-on-surface font-medium">On-Time Delivery (&lt; 2 Days)</span>
              <span class="font-mono font-bold text-emerald-600">8.2% Return Prob.</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-outline-variant/60">
              <span class="text-on-surface font-medium">Standard Delivery (3–5 Days)</span>
              <span class="font-mono font-bold text-on-surface">14.1% Return Prob.</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-outline-variant/60">
              <span class="text-on-surface font-medium">Delayed Shipping (&gt; 6 Days)</span>
              <span class="font-mono font-bold text-red-600">38.7% Return Prob.</span>
            </div>
            <p class="text-[11px] text-on-surface-variant italic mt-1">
              *Couriers experiencing delay anomalies automatically trigger elevated risk scores for COD shipments.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
