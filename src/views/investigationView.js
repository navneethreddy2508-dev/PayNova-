import { store, formatINR } from '../state/store.js';
import { navigate } from '../router.js';

export function renderInvestigationView(container, params = {}) {
  const orderId = params.id || store.activeOrderId || "8921";
  const order = store.getOrderById(orderId) || store.getActiveOrder();
  if (!order) {
    container.innerHTML = `<div class="p-8 text-center text-on-surface-variant">Order not found.</div>`;
    return;
  }

  const caseObj = store.getCaseForOrder(order.id);
  const isHigh = order.riskLevel === 'HIGH';
  const isMed = order.riskLevel === 'MEDIUM';
  const riskBadgeBg = isHigh ? 'bg-red-100 text-red-700' : (isMed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800');
  const riskText = isHigh ? 'text-red-600' : (isMed ? 'text-amber-600' : 'text-emerald-600');

  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-container-max mx-auto">
      <!-- Top Navigation & Breadcrumb -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <div class="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-1">
            <button id="btn-back-to-details" class="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Order Details (${order.code})</span>
            </button>
            <span>/</span>
            <span class="text-on-surface font-semibold">Investigation Case #${caseObj.caseId}</span>
          </div>
          <div class="flex items-center gap-3">
            <h2 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">Return-Risk Investigation</h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              caseObj.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : (caseObj.status === 'Under Review' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')
            }">
              STATUS: ${caseObj.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button id="btn-view-audit-direct" class="px-3.5 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-xs font-semibold flex items-center gap-2 bg-surface-container-lowest cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">history</span>
            <span>View Full Audit Trail</span>
          </button>
        </div>
      </div>

      <!-- Action Confirmation Banner (Dynamic) -->
      <div id="investigation-status-banner" class="hidden p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-emerald-600 text-[24px]">check_circle</span>
          <div>
            <div id="banner-action-title" class="font-bold text-sm">Action Successfully Executed</div>
            <div id="banner-action-subtitle" class="text-xs text-emerald-800">Case status updated and event logged in audit trail.</div>
          </div>
        </div>
        <button id="btn-banner-view-audit" class="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors">
          View Audit Log
        </button>
      </div>

      <!-- Bento Grid: Case Header & Key Prediction Context -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <!-- Return-Risk Case Card (6 cols) -->
        <div class="md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">assignment</span>
                <h3 class="font-headline-sm text-base font-bold text-on-surface">Case Profile: ${caseObj.caseId}</h3>
              </div>
              <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-primary/10 text-primary">Priority: ${caseObj.priority}</span>
            </div>

            <div class="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-body-md">
              <div>
                <span class="text-on-surface-variant font-semibold block">ASSIGNED REVIEWER</span>
                <span class="font-medium text-on-surface">${caseObj.assignedTo}</span>
              </div>
              <div>
                <span class="text-on-surface-variant font-semibold block">LAST UPDATED</span>
                <span class="font-mono text-on-surface">${caseObj.updatedAt}</span>
              </div>
              <div>
                <span class="text-on-surface-variant font-semibold block">CURRENT ACTION STATE</span>
                <span class="font-semibold text-primary">${caseObj.merchantAction}</span>
              </div>
              <div>
                <span class="text-on-surface-variant font-semibold block">REVENUE AT RISK</span>
                <span class="font-mono font-bold text-sm text-red-600">${formatINR(order.revenueAtRisk)}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-outline-variant">
            <span class="text-xs font-semibold text-on-surface-variant block mb-1">AI Risk Summary:</span>
            <p class="text-xs text-on-surface bg-surface p-2.5 rounded border border-outline-variant/60 font-mono leading-relaxed">
              ${caseObj.riskSummary}
            </p>
          </div>
        </div>

        <!-- AI Prediction vs Human Decision Context (6 cols) -->
        <div class="md:col-span-6 bg-surface-container-lowest border-l-4 border-l-primary border-y border-r border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">balance</span>
                <h3 class="font-headline-sm text-base font-bold text-on-surface">Decision Governance Boundary</h3>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant">Human-in-the-Loop</span>
            </div>

            <div class="bg-surface p-3 rounded-lg border border-outline-variant/80 mb-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <span class="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                  <div class="text-xs font-semibold text-on-surface-variant">AI MODEL PREDICTION</div>
                  <div class="text-sm font-bold text-on-surface">${order.returnProbability}% Return Probability</div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold ${riskBadgeBg}">
                ${order.riskLevel} RISK
              </span>
            </div>

            <div class="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
              <div class="font-bold flex items-center gap-1 mb-1">
                <span class="material-symbols-outlined text-[16px] text-amber-700">info</span>
                Autonomous Action Restriction Policy:
              </div>
              The AI Return-Risk Scorer generates probabilistic risk scoring only. Irreversible actions (order cancellation, customer return policy blocking) strictly require verified human merchant authorization below.
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-outline-variant text-xs text-on-surface-variant">
            Target review response SLA: within 4 hours of dispatch preparation.
          </div>
        </div>
      </div>

      <!-- Merchant Review Actions Decision Panel -->
      <section class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-5">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[24px]">rule_settings</span>
            <div>
              <h3 class="font-headline-sm text-base font-bold text-on-surface">Merchant Review Actions</h3>
              <p class="text-xs text-on-surface-variant">Select an action to update this case and append an event to the institutional audit log.</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <!-- Action 1: Monitor Order -->
          <div class="p-4 rounded-xl border border-outline-variant bg-surface flex flex-col justify-between gap-3 hover:border-emerald-500 transition-all group">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm text-on-surface group-hover:text-emerald-700">Monitor Order</span>
                <span class="material-symbols-outlined text-emerald-600 text-[20px]">visibility</span>
              </div>
              <p class="text-xs text-on-surface-variant">Keep order in normal fulfillment pipeline while logging telemetry and post-delivery returns.</p>
            </div>
            <button 
              data-action-type="Monitor Order"
              class="w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-emerald-200 hover:border-emerald-600 cursor-pointer"
            >
              Select: Monitor Order
            </button>
          </div>

          <!-- Action 2: Request Verification -->
          <div class="p-4 rounded-xl border border-outline-variant bg-surface flex flex-col justify-between gap-3 hover:border-amber-500 transition-all group">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm text-on-surface group-hover:text-amber-700">Request Verification</span>
                <span class="material-symbols-outlined text-amber-600 text-[20px]">contact_phone</span>
              </div>
              <p class="text-xs text-on-surface-variant">Trigger merchant customer service WhatsApp/IVR confirmation for sizing, delivery address, or intent.</p>
            </div>
            <button 
              data-action-type="Request Verification"
              class="w-full py-2 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-amber-200 hover:border-amber-600 cursor-pointer"
            >
              Select: Request Verification
            </button>
          </div>

          <!-- Action 3: Flag for Review -->
          <div class="p-4 rounded-xl border border-outline-variant bg-surface flex flex-col justify-between gap-3 hover:border-red-500 transition-all group">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm text-on-surface group-hover:text-red-700">Flag for Senior Review</span>
                <span class="material-symbols-outlined text-red-600 text-[20px]">flag</span>
              </div>
              <p class="text-xs text-on-surface-variant">Escalate to Senior Risk Lead for potential fulfillment restriction or wardrobing investigation.</p>
            </div>
            <button 
              data-action-type="Flag for Review"
              class="w-full py-2 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-red-200 hover:border-red-600 cursor-pointer"
            >
              Select: Flag for Review
            </button>
          </div>

          <!-- Action 4: Mark as Reviewed -->
          <div class="p-4 rounded-xl border border-outline-variant bg-surface flex flex-col justify-between gap-3 hover:border-primary transition-all group">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm text-on-surface group-hover:text-primary">Mark as Reviewed</span>
                <span class="material-symbols-outlined text-primary text-[20px]">verified</span>
              </div>
              <p class="text-xs text-on-surface-variant">Acknowledge risk evaluation, record merchant notes, and close the open investigation case.</p>
            </div>
            <button 
              data-action-type="Mark as Reviewed"
              class="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-lg text-xs font-semibold transition-colors border border-primary/20 hover:border-primary cursor-pointer"
            >
              Select: Mark as Reviewed
            </button>
          </div>
        </div>

        <!-- Optional Review Note Textarea -->
        <div class="flex flex-col gap-1.5 pt-3 border-t border-outline-variant">
          <label for="investigation-note" class="font-label-md text-xs font-semibold text-on-surface">Merchant Reviewer Notes / Justification (Optional)</label>
          <input 
            id="investigation-note"
            type="text" 
            placeholder="e.g., Customer confirmed size via phone call; high ticket order verified; proceeding with standard shipment." 
            class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </section>

      <!-- Investigation Case Notes History -->
      <section class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
          <h3 class="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">chat</span>
            <span>Case Activity &amp; Investigation Log</span>
          </h3>
          <span class="text-xs text-on-surface-variant font-mono">${caseObj.notes.length} Entries Recorded</span>
        </div>

        <div id="investigation-notes-list" class="flex flex-col gap-3">
          ${caseObj.notes.map(n => `
            <div class="p-3 bg-surface rounded-lg border border-outline-variant/60 flex flex-col gap-1">
              <div class="flex justify-between items-center text-xs">
                <span class="font-semibold text-primary">${n.author}</span>
                <span class="font-mono text-[11px] text-on-surface-variant">${n.date}</span>
              </div>
              <p class="text-xs text-on-surface">${n.text}</p>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;

  // Attach event handlers
  const btnBack = container.querySelector('#btn-back-to-details');
  if (btnBack) btnBack.addEventListener('click', () => navigate(`/order-details?id=${order.id}`));

  const btnAuditDirect = container.querySelector('#btn-view-audit-direct');
  if (btnAuditDirect) btnAuditDirect.addEventListener('click', () => navigate('/audit-trail'));

  const btnBannerAudit = container.querySelector('#btn-banner-view-audit');
  if (btnBannerAudit) btnBannerAudit.addEventListener('click', () => navigate('/audit-trail'));

  // Action buttons
  container.querySelectorAll('button[data-action-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const actionType = btn.getAttribute('data-action-type');
      const noteInput = container.querySelector('#investigation-note');
      const note = noteInput ? noteInput.value.trim() : "";

      store.performMerchantAction(order.id, actionType, note);

      // Show banner
      const banner = container.querySelector('#investigation-status-banner');
      const titleEl = container.querySelector('#banner-action-title');
      const subEl = container.querySelector('#banner-action-subtitle');
      if (banner) {
        banner.classList.remove('hidden');
        titleEl.innerText = `Action Recorded: "${actionType}"`;
        subEl.innerText = `Case #${caseObj.caseId} status updated to '${caseObj.status}'. Audit event logged with ID AUD-Trace.`;
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Re-render
      setTimeout(() => {
        renderInvestigationView(container, { id: order.id });
        const refreshedBanner = container.querySelector('#investigation-status-banner');
        if (refreshedBanner) refreshedBanner.classList.remove('hidden');
      }, 300);
    });
  });
}
