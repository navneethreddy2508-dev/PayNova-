import { store, formatINR, formatCompactINR } from '../state/store.js';
import { navigate } from '../router.js';

export function renderDashboardView(container) {
  const kpis = store.analytics.kpis;
  const highRiskOrders = store.orders.filter(o => o.riskLevel === 'HIGH');
  const mediumRiskOrders = store.orders.filter(o => o.riskLevel === 'MEDIUM');
  const lowRiskOrders = store.orders.filter(o => o.riskLevel === 'LOW');

  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-container-max mx-auto">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">Active Inference Engine</span>
            <span class="text-xs text-on-surface-variant">• Model: ${store.modelStats.modelVersion}</span>
          </div>
          <h2 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">Return Risk Overview</h2>
          <p class="font-body-lg text-sm md:text-base text-on-surface-variant">Real-time predictive analysis of e-commerce order return probabilities & revenue at risk.</p>
        </div>
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button id="btn-simulate-order" class="font-label-md text-xs px-3.5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">shopping_cart_checkout</span>
            <span>Simulate Order</span>
          </button>
          <button id="btn-export-dashboard" class="font-label-md text-xs px-3.5 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2 bg-surface-container-lowest cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Report</span>
          </button>
          <button id="btn-view-all-orders" class="font-label-md text-xs px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>Order Monitoring</span>
          </button>
        </div>
      </div>

      <!-- Bento KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <!-- KPI Group 1: Risk Overview (8 Cols) -->
        <div class="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <!-- Total Orders -->
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-primary/40 transition-colors">
            <div class="flex justify-between items-start mb-2">
              <span class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Total Orders</span>
              <span class="material-symbols-outlined text-outline text-[20px]">shopping_cart</span>
            </div>
            <div>
              <div class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">${kpis.totalMonitoredOrders.toLocaleString('en-IN')}</div>
              <span class="text-xs text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
                <span class="material-symbols-outlined text-[14px]">arrow_upward</span> +8.4% vs last week
              </span>
            </div>
          </div>

          <!-- Revenue at Risk (INR) -->
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-primary/40 transition-colors">
            <div class="flex justify-between items-start mb-2">
              <span class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Revenue at Risk</span>
              <span class="material-symbols-outlined text-red-500 text-[20px]">payments</span>
            </div>
            <div>
              <div class="font-display-lg text-2xl md:text-3xl font-bold text-red-600">${formatCompactINR(kpis.totalRevenueAtRisk)}</div>
              <span class="text-xs text-on-surface-variant font-medium mt-1 block">Est. from high/med risk orders</span>
            </div>
          </div>

          <!-- Predicted Return Rate -->
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-primary/40 transition-colors">
            <div class="flex justify-between items-start mb-2">
              <span class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Pred. Return Rate</span>
              <span class="material-symbols-outlined text-outline text-[20px]">trending_up</span>
            </div>
            <div>
              <div class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">${kpis.predictedReturnRate}</div>
              <span class="text-xs text-on-surface-variant font-medium mt-1 block">Avg. store benchmark: 14.2%</span>
            </div>
          </div>

          <!-- High Risk Orders -->
          <div class="bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div class="flex justify-between items-start mb-2">
              <span class="font-label-md text-xs text-red-700 dark:text-red-400 uppercase tracking-wider font-semibold">High Return Risk</span>
              <span class="material-symbols-outlined text-red-600 text-[20px]">error</span>
            </div>
            <div>
              <div class="font-display-lg text-2xl md:text-3xl font-bold text-red-600">${kpis.highRiskOrdersCount}</div>
              <span class="text-xs text-red-700/80 dark:text-red-300 font-medium mt-1 block">Prob. &gt; 70% (Immediate review)</span>
            </div>
          </div>

          <!-- Medium Risk Orders -->
          <div class="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div class="flex justify-between items-start mb-2">
              <span class="font-label-md text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider font-semibold">Medium Risk</span>
              <span class="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
            </div>
            <div>
              <div class="font-display-lg text-2xl md:text-3xl font-bold text-amber-600">${kpis.mediumRiskOrdersCount}</div>
              <span class="text-xs text-amber-700/80 dark:text-amber-300 font-medium mt-1 block">Prob. 40% – 70%</span>
            </div>
          </div>

          <!-- Low Risk Orders -->
          <div class="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div class="flex justify-between items-start mb-2">
              <span class="font-label-md text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-semibold">Low Risk</span>
              <span class="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            </div>
            <div>
              <div class="font-display-lg text-2xl md:text-3xl font-bold text-emerald-600">${kpis.lowRiskOrdersCount.toLocaleString('en-IN')}</div>
              <span class="text-xs text-emerald-700/80 dark:text-emerald-300 font-medium mt-1 block">Prob. &lt; 40% (Standard flow)</span>
            </div>
          </div>
        </div>

        <!-- KPI Group 2: Model Performance Summary (4 Cols) -->
        <div class="md:col-span-4 bg-surface-container-lowest border-l-4 border-l-primary border-y border-r border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">memory</span>
                <h3 class="font-headline-sm text-base font-bold text-on-surface">AI Model Health</h3>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 text-emerald-800 font-semibold">Sample Stats</span>
            </div>
            <div class="grid grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <div class="font-label-md text-xs text-on-surface-variant mb-0.5">Precision</div>
                <div class="font-headline-md text-xl font-bold text-on-surface">${store.modelStats.precision}</div>
              </div>
              <div>
                <div class="font-label-md text-xs text-on-surface-variant mb-0.5">Recall</div>
                <div class="font-headline-md text-xl font-bold text-on-surface">${store.modelStats.recall}</div>
              </div>
              <div>
                <div class="font-label-md text-xs text-on-surface-variant mb-0.5">F1 Score</div>
                <div class="font-headline-md text-xl font-bold text-on-surface">${store.modelStats.f1Score}</div>
              </div>
              <div>
                <div class="font-label-md text-xs text-on-surface-variant mb-0.5">Accuracy</div>
                <div class="font-headline-md text-xl font-bold text-on-surface">${store.modelStats.accuracy}</div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between">
            <p class="font-body-md text-xs text-on-surface-variant">Stability: No significant drift detected.</p>
            <button id="btn-view-model-stats" class="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
              <span>Deep Analysis</span>
              <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <!-- Return Risk Over Time Trend (8 cols) -->
        <div class="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-headline-sm text-base font-bold text-on-surface">Return Risk &amp; Recovered Revenue (Monthly)</h3>
              <p class="font-body-md text-xs text-on-surface-variant">Trend of orders flagged vs actual revenue saved through early interventions (in ₹)</p>
            </div>
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Revenue at Risk (₹)</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Recovered (₹)</span>
            </div>
          </div>
          <div class="w-full h-56 rounded-lg border border-outline-variant/60 bg-surface/50 p-3 flex flex-col justify-between relative overflow-hidden">
            <!-- Custom Styled SVG Trend Chart -->
            <svg class="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#004ac6" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#004ac6" stop-opacity="0.0"/>
                </linearGradient>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.2"/>
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <!-- Grid Lines -->
              <line x1="0" y1="30" x2="500" y2="30" stroke="#e1e2ed" stroke-dasharray="3 3"/>
              <line x1="0" y1="75" x2="500" y2="75" stroke="#e1e2ed" stroke-dasharray="3 3"/>
              <line x1="0" y1="120" x2="500" y2="120" stroke="#e1e2ed" stroke-dasharray="3 3"/>
              
              <!-- Area 1: Revenue at risk -->
              <path d="M 10 130 Q 100 115, 190 95 T 380 65 T 490 40 L 490 170 L 10 170 Z" fill="url(#primaryGradient)"/>
              <path d="M 10 130 Q 100 115, 190 95 T 380 65 T 490 40" fill="none" stroke="#004ac6" stroke-width="2.5"/>

              <!-- Area 2: Recovered revenue -->
              <path d="M 10 155 Q 100 145, 190 135 T 380 120 T 490 110 L 490 170 L 10 170 Z" fill="url(#emeraldGradient)"/>
              <path d="M 10 155 Q 100 145, 190 135 T 380 120 T 490 110" fill="none" stroke="#10b981" stroke-width="2.5"/>
            </svg>
            <div class="flex justify-between items-center text-[11px] font-mono text-on-surface-variant px-2 pt-1 border-t border-outline-variant/40">
              <span>Mar (₹3.8L)</span>
              <span>Apr (₹4.5L)</span>
              <span>May (₹5.2L)</span>
              <span>Jun (₹4.9L)</span>
              <span>Jul (₹5.9L)</span>
              <span>Aug (₹6.2L)</span>
            </div>
          </div>
        </div>

        <!-- Risk Distribution Donut (4 cols) -->
        <div class="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <h3 class="font-headline-sm text-base font-bold text-on-surface mb-2">Risk Probability Distribution</h3>
          <div class="relative flex items-center justify-center my-2">
            <svg class="w-40 h-40" viewBox="0 0 36 36">
              <!-- Low (76.5%) -->
              <path class="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="76.5, 100" stroke-width="3.8"></path>
              <!-- Medium (18.4%) -->
              <path class="text-amber-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="18.4, 100" stroke-dashoffset="-76.5" stroke-width="3.8"></path>
              <!-- High (5.1%) -->
              <path class="text-red-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="5.1, 100" stroke-dashoffset="-94.9" stroke-width="3.8"></path>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="font-label-md text-[10px] text-on-surface-variant uppercase font-semibold">Total Orders</span>
              <span class="font-headline-md text-xl font-bold text-on-surface">${kpis.totalMonitoredOrders.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center pt-3 border-t border-outline-variant">
            <div class="p-1 rounded bg-emerald-50 text-emerald-800">
              <span class="text-[11px] font-semibold block">Low (76%)</span>
              <span class="text-[10px] font-mono">1,876</span>
            </div>
            <div class="p-1 rounded bg-amber-50 text-amber-800">
              <span class="text-[11px] font-semibold block">Med (18%)</span>
              <span class="text-[10px] font-mono">450</span>
            </div>
            <div class="p-1 rounded bg-red-50 text-red-800">
              <span class="text-[11px] font-semibold block">High (5%)</span>
              <span class="text-[10px] font-mono">124</span>
            </div>
          </div>
        </div>
      </div>

      <!-- High Return-Risk Orders Feed Table -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden mb-4">
        <div class="p-4 sm:p-5 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-container-low">
          <div>
            <h3 class="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span>High Return-Risk Order Queue</span>
            </h3>
            <p class="text-xs text-on-surface-variant">Orders flagged by PayNova ReturnGuard model with elevated return probabilities requiring merchant action.</p>
          </div>
          <button id="btn-view-all-table" class="font-label-md text-xs font-semibold text-primary hover:text-primary-container transition-colors flex items-center gap-1 cursor-pointer">
            <span>View All Monitored Orders</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-lowest border-b border-outline-variant font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
                <th class="p-4 font-semibold">Order ID</th>
                <th class="p-4 font-semibold">Customer</th>
                <th class="p-4 font-semibold">Product &amp; Category</th>
                <th class="p-4 font-semibold">Order Value</th>
                <th class="p-4 font-semibold">Return Prob.</th>
                <th class="p-4 font-semibold">Revenue at Risk</th>
                <th class="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody class="font-body-md text-sm text-on-surface divide-y divide-outline-variant/60">
              ${store.orders.slice(0, 5).map(order => {
                const isHigh = order.riskLevel === 'HIGH';
                const isMed = order.riskLevel === 'MEDIUM';
                const badgeBg = isHigh ? 'bg-red-100 text-red-700' : (isMed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800');
                const dotColor = isHigh ? 'bg-red-600' : (isMed ? 'bg-amber-500' : 'bg-emerald-600');

                return `
                  <tr class="hover:bg-surface-container-low transition-colors group">
                    <td class="p-4 font-mono-data font-semibold text-primary">
                      ${order.code}
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2.5">
                        <img src="${order.customer.avatar}" class="w-7 h-7 rounded-full object-cover border border-outline-variant" alt="${order.customer.name}"/>
                        <div>
                          <div class="font-medium text-on-surface">${order.customer.name}</div>
                          <div class="text-xs text-on-surface-variant font-mono">Ret: ${order.customer.returnRate}%</div>
                        </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <div class="font-medium line-clamp-1">${order.product.name}</div>
                      <div class="text-xs text-on-surface-variant">${order.product.category}</div>
                    </td>
                    <td class="p-4 font-mono-data font-semibold">
                      ${formatINR(order.value)}
                    </td>
                    <td class="p-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${badgeBg}">
                        <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
                        ${order.returnProbability}%
                      </span>
                    </td>
                    <td class="p-4 font-mono-data font-semibold ${isHigh ? 'text-red-600' : 'text-on-surface'}">
                      ${formatINR(order.revenueAtRisk)}
                    </td>
                    <td class="p-4 text-right">
                      <button 
                        data-action="investigate" 
                        data-id="${order.id}" 
                        class="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary font-label-md text-xs font-semibold rounded-lg transition-all duration-150 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span class="material-symbols-outlined text-[14px]">travel_explore</span>
                        <span>Investigate</span>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  container.querySelectorAll('[data-action="investigate"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-id');
      store.selectOrder(orderId);
      navigate(`/order-details?id=${orderId}`);
    });
  });

  const btnSimulate = container.querySelector('#btn-simulate-order');
  if (btnSimulate) btnSimulate.addEventListener('click', () => navigate('/simulator'));

  const btnViewAll = container.querySelector('#btn-view-all-orders');
  if (btnViewAll) btnViewAll.addEventListener('click', () => navigate('/orders'));

  const btnViewTable = container.querySelector('#btn-view-all-table');
  if (btnViewTable) btnViewTable.addEventListener('click', () => navigate('/orders'));

  const btnViewModel = container.querySelector('#btn-view-model-stats');
  if (btnViewModel) btnViewModel.addEventListener('click', () => navigate('/model-stats'));

  const btnExport = container.querySelector('#btn-export-dashboard');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      alert("Executive Return-Risk Report exported as PDF (Sample action)");
    });
  }
}
