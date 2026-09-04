import { store, formatINR } from '../state/store.js';
import { navigate } from '../router.js';
import { ReturnRiskAPI } from '../services/api.js';

export function renderOrderDetailsView(container, params = {}) {
  const orderId = params.id || store.activeOrderId || "8921";
  const order = store.getOrderById(orderId) || store.getActiveOrder();
  if (!order) {
    container.innerHTML = `<div class="p-8 text-center text-on-surface-variant">Order not found.</div>`;
    return;
  }

  const isHigh = order.riskLevel === 'HIGH';
  const isMed = order.riskLevel === 'MEDIUM';
  const riskBorder = isHigh ? 'border-l-error' : (isMed ? 'border-l-amber-500' : 'border-l-emerald-500');
  const riskBadgeBg = isHigh ? 'bg-error-container text-on-error-container' : (isMed ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900');
  const riskDot = isHigh ? 'bg-error' : (isMed ? 'bg-amber-600' : 'bg-emerald-600');
  const riskText = isHigh ? 'text-error' : (isMed ? 'text-amber-600' : 'text-emerald-600');

  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-container-max mx-auto">
      <!-- Breadcrumb & Top Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <div class="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-1">
            <button id="btn-back-to-orders" class="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Orders Monitoring</span>
            </button>
            <span>/</span>
            <span class="text-on-surface font-semibold">${order.code}</span>
          </div>
          <div class="flex items-center gap-3">
            <h2 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">Order Details &amp; Return Analysis</h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${riskBadgeBg}">
              ${order.riskLevel} RETURN RISK
            </span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button id="btn-attach-evidence" class="px-3.5 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-xs font-semibold flex items-center gap-2 bg-surface-container-lowest cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">attachment</span>
            <span>Attach Evidence</span>
          </button>
          <button id="btn-open-investigation" class="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-xs font-semibold transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">gavel</span>
            <span>Investigate &amp; Merchant Action</span>
          </button>
        </div>
      </div>

      <!-- Hero Risk Indicator Banner (From Stitch) -->
      <section class="bg-surface-container-lowest border-l-[6px] ${riskBorder} border-y border-r border-outline-variant rounded-r-xl rounded-l-sm p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div class="flex flex-col gap-2 max-w-2xl">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-3 py-1 rounded-full ${riskBadgeBg} border border-outline-variant/40">
              <span class="w-2 h-2 rounded-full ${riskDot}"></span>
              <span class="font-label-md text-xs uppercase font-bold tracking-wider">${order.riskLevel} RISK PREDICTION</span>
            </div>
            <span class="font-label-md text-xs text-on-surface-variant flex items-center gap-1 font-mono">
              <span class="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
              AI Prediction Model ${store.modelStats.modelVersion}
            </span>
          </div>
          <h3 class="font-headline-md text-xl md:text-2xl font-bold text-on-surface">
            ${isHigh ? 'Elevated Return Probability Detected' : (isMed ? 'Moderate Return Propensity Detected' : 'Standard Order — Low Return Risk')}
          </h3>
          <p class="font-body-lg text-sm text-on-surface-variant">
            ${isHigh 
              ? 'Based on historical customer patterns and category return rates, this order exhibits strong signals correlating with an imminent return or refund claim.' 
              : 'Statistical signals align with normal purchasing patterns. Continuous monitoring active.'}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-outline-variant/60 pt-4 md:pt-0 md:pl-6">
          <div class="flex flex-col items-end">
            <div class="flex items-baseline gap-1">
              <span class="font-display-lg text-4xl font-extrabold ${riskText}">${order.returnProbability}</span>
              <span class="font-headline-sm text-2xl font-bold ${riskText}">%</span>
            </div>
            <span class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Return Probability</span>
          </div>
          <div class="flex flex-col items-end">
            <div class="font-display-lg text-2xl font-extrabold text-on-surface font-mono">${formatINR(order.revenueAtRisk)}</div>
            <span class="font-label-md text-xs text-red-600 uppercase tracking-wider font-semibold">Revenue at Risk (₹)</span>
          </div>
        </div>
      </section>

      <!-- Bento Grid: Order Info, Customer History, Product Analytics -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <!-- Section 1: Order Information (4 cols) -->
        <section class="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 class="font-headline-sm text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant pb-3">
              <span class="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
              <span>Order Information</span>
            </h3>
            <div class="flex flex-col gap-3 font-body-md text-xs">
              <div class="flex justify-between items-center py-1.5 border-b border-surface-variant">
                <span class="text-on-surface-variant font-semibold">ORDER ID</span>
                <span class="font-mono-data font-bold text-primary">${order.code}</span>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-surface-variant">
                <span class="text-on-surface-variant font-semibold">ORDER DATE</span>
                <span class="font-mono-data">${order.formattedDate}</span>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-surface-variant">
                <span class="text-on-surface-variant font-semibold">PAYMENT METHOD</span>
                <span class="font-medium text-right">${order.paymentMethod}</span>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-surface-variant">
                <span class="text-on-surface-variant font-semibold">ORDER VALUE</span>
                <span class="font-mono-data font-bold text-base text-on-surface">${formatINR(order.value)}</span>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-surface-variant">
                <span class="text-on-surface-variant font-semibold">SHIPPING CITY</span>
                <span>${order.shippingCity}</span>
              </div>
              <div class="flex justify-between items-center py-1.5">
                <span class="text-on-surface-variant font-semibold">DELIVERY STATUS</span>
                <span class="px-2 py-0.5 bg-surface-container-high rounded text-on-surface font-semibold text-xs">${order.deliveryStatus}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 2: Customer History (4 cols) -->
        <section class="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 class="font-headline-sm text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant pb-3">
              <span class="material-symbols-outlined text-primary text-[20px]">person_search</span>
              <span>Customer Return History</span>
            </h3>
            <div class="flex items-center gap-3 mb-4">
              <img src="${order.customer.avatar}" class="w-11 h-11 rounded-full object-cover border border-outline-variant" alt="${order.customer.name}"/>
              <div>
                <div class="font-bold text-sm text-on-surface">${order.customer.name}</div>
                <div class="text-xs text-on-surface-variant font-mono">${order.customer.id} • ${order.customer.segment}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-surface p-2.5 rounded-lg border border-outline-variant flex flex-col">
                <span class="font-label-md text-[11px] text-on-surface-variant uppercase font-semibold">Total Orders</span>
                <span class="font-headline-sm text-lg font-bold text-on-surface font-mono">${order.customer.totalOrders}</span>
              </div>
              <div class="bg-surface p-2.5 rounded-lg border border-outline-variant flex flex-col">
                <span class="font-label-md text-[11px] text-on-surface-variant uppercase font-semibold">Past Returns</span>
                <span class="font-headline-sm text-lg font-bold ${order.customer.totalReturns > 3 ? 'text-red-600' : 'text-on-surface'} font-mono">${order.customer.totalReturns}</span>
              </div>
            </div>
            <div class="bg-surface p-2.5 rounded-lg border border-outline-variant flex flex-col gap-1.5 mb-2">
              <div class="flex justify-between items-center">
                <span class="font-label-md text-xs font-semibold uppercase text-on-surface-variant">Customer Return Rate</span>
                <span class="font-mono-data text-sm font-bold ${order.customer.returnRate > 30 ? 'text-red-600' : 'text-emerald-600'}">${order.customer.returnRate}%</span>
              </div>
              <div class="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                <div class="bg-red-500 h-full rounded-full" style="width: ${Math.min(100, order.customer.returnRate)}%"></div>
              </div>
            </div>
          </div>
          <p class="text-[11px] text-on-surface-variant mt-2 italic">${order.customer.notes}</p>
        </section>

        <!-- Section 3: Product Analytics (4 cols) -->
        <section class="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 class="font-headline-sm text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant pb-3">
              <span class="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
              <span>Product Return Propensity</span>
            </h3>
            <div class="flex gap-3 mb-4 items-center">
              <img src="${order.product.image}" class="w-14 h-14 rounded-lg object-cover border border-outline-variant shrink-0" alt="${order.product.name}"/>
              <div class="flex flex-col">
                <span class="font-semibold text-xs text-on-surface line-clamp-2">${order.product.name}</span>
                <span class="font-mono text-[11px] text-on-surface-variant mt-0.5">SKU: ${order.product.sku}</span>
              </div>
            </div>
            <div class="flex flex-col gap-2.5 text-xs font-body-md">
              <div class="flex justify-between items-center py-1 border-b border-surface-variant">
                <span class="text-on-surface-variant font-semibold">CATEGORY</span>
                <span class="font-medium">${order.product.category}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-surface-variant">
                <span class="text-on-surface-variant font-semibold">CATEGORY RETURN RATE</span>
                <span class="font-mono font-bold">${order.product.categoryReturnRate}%</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-on-surface-variant font-semibold">SKU RETURN RATE</span>
                <span class="font-mono font-bold text-red-600">${order.product.productReturnRate}%</span>
              </div>
            </div>
          </div>
          <div class="mt-3 pt-2 border-t border-outline-variant">
            <span class="font-label-md text-[11px] text-on-surface-variant uppercase font-semibold block mb-1">Top Return Reasons:</span>
            <ul class="text-[11px] text-on-surface-variant list-disc pl-4 space-y-0.5">
              ${order.product.commonReturnReasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </section>
      </div>

      <!-- Feature Importance / Explainability (AI Insights Breakdown) -->
      <section class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm border-l-4 border-l-primary">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-outline-variant">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[24px]">psychology</span>
            <div>
              <h3 class="font-headline-sm text-base font-bold text-on-surface">Why is this order likely to be returned? (AI Explainability)</h3>
              <p class="text-xs text-on-surface-variant">SHAP-derived feature contribution ranking for Order #${order.id}</p>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded text-xs font-mono bg-surface-container-high text-on-surface font-medium">Explainability Confidence: 94%</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${order.factors.map(f => {
            const isPos = f.weight > 0;
            const barColor = isPos ? 'bg-red-500' : 'bg-emerald-500';
            const textColor = isPos ? 'text-red-600' : 'text-emerald-600';
            const widthPct = Math.abs(f.weight) * 100;

            return `
              <div class="p-3 bg-surface rounded-lg border border-outline-variant/60 flex flex-col gap-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-medium text-on-surface">${f.name}</span>
                  <span class="font-mono font-bold ${textColor}">${f.impact}</span>
                </div>
                <div class="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                  <div class="${barColor} h-full rounded-full" style="width: ${widthPct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Evidence Section -->
      <section class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[22px]">folder_shared</span>
            <h3 class="font-headline-sm text-base font-bold text-on-surface">Supporting Evidence &amp; Verification Documents</h3>
          </div>
          <button id="btn-add-evidence-inline" class="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">add</span>
            <span>Attach New Evidence</span>
          </button>
        </div>

        ${(!order.evidence || order.evidence.length === 0) ? `
          <div class="p-6 text-center text-on-surface-variant text-xs bg-surface rounded-lg border border-dashed border-outline-variant">
            No supporting evidence attached yet for this order. Click "Attach New Evidence" to add invoice screenshots, call logs, or courier POD.
          </div>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            ${order.evidence.map(ev => `
              <div class="p-3.5 bg-surface rounded-lg border border-outline-variant flex items-start gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span class="material-symbols-outlined text-[20px]">
                    ${ev.type === 'receipt' ? 'receipt' : (ev.type === 'delivery' ? 'local_shipping' : 'description')}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-xs text-on-surface truncate">${ev.title}</h4>
                  <p class="text-[11px] text-on-surface-variant font-mono mt-0.5">${ev.file}</p>
                  <span class="text-[10px] text-on-surface-variant/80 block mt-1">Uploaded: ${ev.date}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </section>
    </div>
  `;

  // Attach handlers
  const btnBack = container.querySelector('#btn-back-to-orders');
  if (btnBack) btnBack.addEventListener('click', () => navigate('/orders'));

  const btnInvestigate = container.querySelector('#btn-open-investigation');
  if (btnInvestigate) {
    btnInvestigate.addEventListener('click', () => {
      navigate(`/investigation?id=${order.id}`);
    });
  }

  const btnAttach = container.querySelector('#btn-attach-evidence');
  const btnAttachInline = container.querySelector('#btn-add-evidence-inline');

  const openEvidenceModal = () => {
    let existingModal = document.getElementById('evidence-modal-root');
    if (existingModal) existingModal.remove();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'evidence-modal-root';
    modalRoot.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs animate-in fade-in duration-150';

    modalRoot.innerHTML = `
      <div class="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Modal Header -->
        <div class="p-5 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[24px]">folder_shared</span>
            </div>
            <div>
              <h3 class="font-headline-sm text-base font-bold text-on-surface">Attach Forensic Evidence</h3>
              <p class="text-xs text-on-surface-variant">Link verification documents, receipts, or communication to Order #${order.id}</p>
            </div>
          </div>
          <button type="button" id="btn-close-evidence-modal" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" title="Close">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Form Body -->
        <form id="evidence-upload-form" class="p-5 md:p-6 flex flex-col gap-4">
          
          <!-- Validation Warning Banner -->
          <div id="modal-error-banner" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
            <span id="modal-error-text">Please select a valid evidence file before uploading.</span>
          </div>

          <!-- Evidence Title -->
          <div class="flex flex-col gap-1.5">
            <label for="evidence-title-input" class="font-label-md text-xs font-semibold text-on-surface uppercase tracking-wider">Evidence Title</label>
            <input 
              id="evidence-title-input" 
              type="text" 
              value="Courier Proof of Delivery (POD)" 
              placeholder="e.g., Courier POD, Customer WhatsApp Transcript, Invoice Copy" 
              class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
              required 
            />
          </div>

          <!-- Evidence Category Type -->
          <div class="flex flex-col gap-1.5">
            <label for="evidence-type-select" class="font-label-md text-xs font-semibold text-on-surface uppercase tracking-wider">Document Type</label>
            <select 
              id="evidence-type-select" 
              class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="delivery">Delivery / Courier POD</option>
              <option value="receipt">Order Invoice / Payment Receipt</option>
              <option value="communication">Customer WhatsApp / Call Transcript</option>
              <option value="damage">Product Photo / Damaged Item Evidence</option>
              <option value="other">Other Supporting Document</option>
            </select>
          </div>

          <!-- Drag and Drop Upload Area -->
          <div class="flex flex-col gap-1.5">
            <label class="font-label-md text-xs font-semibold text-on-surface uppercase tracking-wider">Upload Evidence Document</label>
            
            <div 
              id="evidence-dropzone" 
              class="border-2 border-dashed border-outline-variant rounded-xl p-5 text-center bg-surface hover:bg-surface-container-low transition-all cursor-pointer flex flex-col items-center justify-center gap-2 select-none group"
            >
              <!-- Empty State -->
              <div id="dropzone-empty-state" class="flex flex-col items-center justify-center gap-1.5 w-full">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform mb-1">
                  <span class="material-symbols-outlined text-[28px]">cloud_upload</span>
                </div>
                <div class="text-xs font-semibold text-on-surface">Select file or drag &amp; drop screenshot/receipt</div>
                <div class="text-[11px] text-on-surface-variant font-mono">Supports PNG, JPG, JPEG, PDF, WEBP up to 10MB</div>
                
                <button 
                  type="button" 
                  id="btn-browse-file" 
                  class="mt-2 px-4 py-1.5 bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest rounded-lg text-xs font-semibold text-on-surface transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span class="material-symbols-outlined text-[16px]">folder_open</span>
                  <span>Browse File</span>
                </button>
              </div>

              <!-- Selected File Card (Hidden initially) -->
              <div id="dropzone-file-state" class="hidden w-full p-3.5 bg-surface-container rounded-xl border border-primary/40 flex items-center justify-between gap-3 text-left">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span id="selected-file-icon" class="material-symbols-outlined text-[22px]">description</span>
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span id="selected-file-name" class="text-xs font-bold text-on-surface truncate">filename.pdf</span>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span id="selected-file-size" class="text-[10px] font-mono text-on-surface-variant">0 KB</span>
                      <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Ready</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button type="button" id="btn-change-file" class="px-2.5 py-1 text-xs text-primary hover:bg-primary/10 rounded font-semibold transition-colors cursor-pointer">Change</button>
                  <button type="button" id="btn-remove-file" class="p-1 text-on-surface-variant hover:text-red-600 rounded transition-colors cursor-pointer" title="Remove file">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              <!-- Hidden Real Native File Input -->
              <input 
                type="file" 
                id="evidence-file-input" 
                accept=".png,.jpg,.jpeg,.pdf,.webp,image/png,image/jpeg,image/webp,application/pdf" 
                class="hidden" 
              />
            </div>
          </div>

          <!-- Notes / Justification -->
          <div class="flex flex-col gap-1.5">
            <label for="evidence-notes-input" class="font-label-md text-xs font-semibold text-on-surface uppercase tracking-wider">Reviewer Notes (Optional)</label>
            <textarea 
              id="evidence-notes-input" 
              rows="2" 
              placeholder="e.g. Courier dispatch tracking confirmed; delivery signature verified on AWB document." 
              class="w-full py-2 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md"
            ></textarea>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant mt-2">
            <button 
              type="button" 
              id="btn-cancel-modal" 
              class="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              id="btn-save-evidence" 
              class="px-5 py-2.5 bg-primary text-on-primary hover:bg-primary-container font-label-md text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">link</span>
              <span>Save &amp; Link Evidence</span>
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalRoot);

    // Modal elements
    const form = modalRoot.querySelector('#evidence-upload-form');
    const btnClose = modalRoot.querySelector('#btn-close-evidence-modal');
    const btnCancel = modalRoot.querySelector('#btn-cancel-modal');
    const fileInput = modalRoot.querySelector('#evidence-file-input');
    const btnBrowse = modalRoot.querySelector('#btn-browse-file');
    const dropzone = modalRoot.querySelector('#evidence-dropzone');
    const emptyState = modalRoot.querySelector('#dropzone-empty-state');
    const fileState = modalRoot.querySelector('#dropzone-file-state');
    const errorBanner = modalRoot.querySelector('#modal-error-banner');
    const errorText = modalRoot.querySelector('#modal-error-text');
    const btnChange = modalRoot.querySelector('#btn-change-file');
    const btnRemove = modalRoot.querySelector('#btn-remove-file');

    let selectedFile = null;

    const closeModal = () => {
      modalRoot.remove();
    };

    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    modalRoot.addEventListener('click', (e) => {
      if (e.target === modalRoot) closeModal();
    });

    const formatBytes = (bytes) => {
      if (!bytes || bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleFileSelect = (file) => {
      if (!file) return;
      const validExts = ['.png', '.jpg', '.jpeg', '.pdf', '.webp'];
      const name = file.name.toLowerCase();
      const isValid = validExts.some(ext => name.endsWith(ext));

      if (!isValid) {
        errorBanner.classList.remove('hidden');
        errorText.textContent = 'Please select a supported evidence file (PNG, JPG, JPEG, PDF, WEBP).';
        return;
      }

      selectedFile = file;
      errorBanner.classList.add('hidden');

      modalRoot.querySelector('#selected-file-name').textContent = file.name;
      modalRoot.querySelector('#selected-file-size').textContent = `${formatBytes(file.size)} • Selected`;

      const iconEl = modalRoot.querySelector('#selected-file-icon');
      if (name.endsWith('.pdf')) {
        iconEl.textContent = 'picture_as_pdf';
      } else if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')) {
        iconEl.textContent = 'image';
      } else {
        iconEl.textContent = 'description';
      }

      emptyState.classList.add('hidden');
      fileState.classList.remove('hidden');
    };

    btnBrowse.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    dropzone.addEventListener('click', () => {
      if (!selectedFile) {
        fileInput.click();
      }
    });

    btnChange.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    btnRemove.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedFile = null;
      fileInput.value = '';
      emptyState.classList.remove('hidden');
      fileState.classList.add('hidden');
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('border-primary', 'bg-primary/5');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-primary', 'bg-primary/5');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-primary', 'bg-primary/5');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!selectedFile) {
        errorBanner.classList.remove('hidden');
        errorText.textContent = 'Please select an evidence file before saving.';
        dropzone.classList.add('border-red-400');
        setTimeout(() => dropzone.classList.remove('border-red-400'), 1500);
        return;
      }

      const title = modalRoot.querySelector('#evidence-title-input').value.trim() || 'Supporting Document';
      const type = modalRoot.querySelector('#evidence-type-select').value || 'document';
      const notes = modalRoot.querySelector('#evidence-notes-input').value.trim();

      // Prepare FormData for real API upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('evidence_type', type);
      if (notes) formData.append('notes', notes);

      // Local store update
      store.attachEvidence(order.id, {
        title: title,
        fileName: selectedFile.name,
        type: type,
        fileSize: selectedFile.size,
        notes: notes
      });

      // Async backend upload sync
      ReturnRiskAPI.uploadEvidence(order.id, formData).catch(err => {
        console.warn('[Evidence] Backend upload sync notice:', err.message);
      });

      closeModal();
      renderOrderDetailsView(container, { id: order.id });
    });
  };

  if (btnAttach) btnAttach.addEventListener('click', openEvidenceModal);
  if (btnAttachInline) btnAttachInline.addEventListener('click', openEvidenceModal);
}
