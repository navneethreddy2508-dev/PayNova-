import { store } from '../state/store.js';
import { navigate } from '../router.js';

export function renderAuditTrailView(container) {
  let selectedOrderFilter = "ALL";

  function renderList() {
    const listContainer = container.querySelector('#audit-events-container');
    const filteredEvents = selectedOrderFilter === "ALL" 
      ? store.auditTrail 
      : store.auditTrail.filter(e => String(e.orderId) === String(selectedOrderFilter));

    if (!listContainer) return;

    if (filteredEvents.length === 0) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-on-surface-variant text-sm">
          No audit events found for the selected order filter.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filteredEvents.map((evt, idx) => {
      const isLast = idx === filteredEvents.length - 1;
      const isAI = evt.actionType === 'MODEL_EVAL' || evt.actionType === 'RISK_FLAG';
      const isMerchant = evt.actionType === 'MERCHANT_ACTION';
      const isEvidence = evt.actionType === 'EVIDENCE_ADDED';

      let icon = 'smart_toy';
      let iconColor = 'text-primary bg-primary/10';
      if (isMerchant) {
        icon = 'gavel';
        iconColor = 'text-purple-600 bg-purple-50';
      } else if (isEvidence) {
        icon = 'attachment';
        iconColor = 'text-blue-600 bg-blue-50';
      } else if (evt.actionType === 'RISK_FLAG') {
        icon = 'warning';
        iconColor = 'text-red-600 bg-red-50';
      }

      return `
        <div class="relative flex items-start gap-4 pb-8 ${isLast ? '' : 'border-l-2 border-outline-variant ml-4 pl-6'}">
          <!-- Timeline Icon Bubble -->
          <div class="absolute -left-[17px] top-0 w-8 h-8 rounded-full ${iconColor} border-2 border-surface flex items-center justify-center shrink-0 shadow-xs">
            <span class="material-symbols-outlined text-[16px]">${icon}</span>
          </div>

          <!-- Content Card -->
          <div class="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-xs ml-4 sm:ml-0">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-outline-variant/60">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-sm text-on-surface">${evt.event}</span>
                <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-surface-container text-primary">
                  Order #${evt.orderId}
                </span>
                ${evt.returnProbability !== '-' ? `
                  <span class="px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    parseInt(evt.returnProbability) > 70 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }">
                    ${evt.returnProbability} Return Prob.
                  </span>
                ` : ''}
              </div>
              <span class="font-mono text-xs text-on-surface-variant">${evt.timestamp}</span>
            </div>

            <p class="text-xs text-on-surface mt-2 font-mono leading-relaxed">
              ${evt.details}
            </p>

            <div class="flex items-center justify-between mt-3 pt-2 border-t border-outline-variant/40 text-[11px] text-on-surface-variant">
              <div class="flex items-center gap-1.5">
                <span class="font-semibold">Actor:</span>
                <span class="text-on-surface font-medium">${evt.actor}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono">Engine: ${evt.modelVersion}</span>
                <button data-inspect-order="${evt.orderId}" class="text-primary font-semibold hover:underline flex items-center gap-0.5 cursor-pointer">
                  <span>Inspect Order</span>
                  <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach inspect buttons
    listContainer.querySelectorAll('button[data-inspect-order]').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-inspect-order');
        store.selectOrder(orderId);
        navigate(`/order-details?id=${orderId}`);
      });
    });
  }

  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-container-max mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <p class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Institutional Governance</p>
          <h2 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">Return-Risk Audit Trail</h2>
          <p class="font-body-lg text-sm text-on-surface-variant">Complete immutable timeline of AI prediction evaluations, feature extractions, and merchant review actions.</p>
        </div>

        <!-- Filter Dropdown -->
        <div class="flex items-center gap-3">
          <label class="text-xs font-semibold text-on-surface-variant" for="select-audit-order">Filter by Order:</label>
          <select id="select-audit-order" class="py-1.5 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-mono text-on-surface focus:outline-none focus:border-primary">
            <option value="ALL">All Monitored Orders (${store.auditTrail.length} events)</option>
            ${store.orders.map(o => `
              <option value="${o.id}">Order #${o.id} (${o.customer.name})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Timeline Canvas -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 md:p-8 shadow-sm">
        <div id="audit-events-container" class="flex flex-col">
          <!-- Populated by renderList() -->
        </div>
      </div>
    </div>
  `;

  const selectOrder = container.querySelector('#select-audit-order');
  selectOrder.addEventListener('change', (e) => {
    selectedOrderFilter = e.target.value;
    renderList();
  });

  renderList();
}
