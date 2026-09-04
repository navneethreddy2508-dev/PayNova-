import { store, formatINR } from '../state/store.js';
import { navigate } from '../router.js';

export function renderOrdersView(container) {
  function updateTable() {
    const filteredOrders = store.getFilteredOrders();
    const tbody = container.querySelector('#orders-table-body');
    const cardsContainer = container.querySelector('#orders-mobile-cards');
    const countEl = container.querySelector('#orders-filtered-count');

    if (countEl) {
      countEl.innerText = `${filteredOrders.length} Orders matching filter`;
    }

    if (tbody) {
      if (filteredOrders.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="p-8 text-center text-on-surface-variant">
              <span class="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
              <p class="font-medium text-sm">No orders match your search or filter criteria.</p>
              <button id="btn-reset-filters" class="mt-3 px-3 py-1.5 bg-surface-container-high rounded text-xs font-semibold text-primary hover:bg-surface-container-highest">Reset Filters</button>
            </td>
          </tr>
        `;
        const resetBtn = tbody.querySelector('#btn-reset-filters');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            store.searchQuery = "";
            store.filterRisk = "ALL";
            store.filterCategory = "ALL";
            renderOrdersView(container);
          });
        }
      } else {
        tbody.innerHTML = filteredOrders.map(order => {
          const isHigh = order.riskLevel === 'HIGH';
          const isMed = order.riskLevel === 'MEDIUM';
          const badgeBg = isHigh ? 'bg-red-100 text-red-700' : (isMed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800');
          const dotColor = isHigh ? 'bg-red-600' : (isMed ? 'bg-amber-500' : 'bg-emerald-600');

          return `
            <tr class="hover:bg-surface-container-low transition-colors group cursor-pointer" data-id="${order.id}">
              <td class="p-4 font-mono-data font-semibold text-primary">
                ${order.code}
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2.5">
                  <img src="${order.customer.avatar}" class="w-8 h-8 rounded-full object-cover border border-outline-variant" alt="${order.customer.name}"/>
                  <div>
                    <div class="font-medium text-on-surface text-sm">${order.customer.name}</div>
                    <div class="text-xs text-on-surface-variant font-mono">${order.customer.id}</div>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="font-medium text-sm text-on-surface line-clamp-1">${order.product.name}</div>
                <div class="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  <span class="px-1.5 py-0.5 rounded bg-surface-container text-[11px] font-medium">${order.product.category}</span>
                  <span>• ${order.paymentMethod}</span>
                </div>
              </td>
              <td class="p-4 font-mono-data font-semibold text-sm">
                ${formatINR(order.value)}
              </td>
              <td class="p-4">
                <div class="text-xs font-mono font-medium">${order.customer.totalReturns} / ${order.customer.totalOrders} <span class="text-on-surface-variant">(${order.customer.returnRate}%)</span></div>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${badgeBg}">
                  <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
                  ${order.returnProbability}%
                </span>
              </td>
              <td class="p-4">
                <span class="px-2 py-1 rounded text-xs font-medium bg-surface-container-high text-on-surface">
                  ${order.status || 'Monitored'}
                </span>
              </td>
              <td class="p-4 text-right">
                <button 
                  data-action="investigate" 
                  data-id="${order.id}" 
                  class="px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-container font-label-md text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>Investigate</span>
                  <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </td>
            </tr>
          `;
        }).join('');

        tbody.querySelectorAll('tr[data-id]').forEach(row => {
          row.addEventListener('click', (e) => {
            if (e.target.closest('button[data-action="investigate"]')) return;
            const id = row.getAttribute('data-id');
            store.selectOrder(id);
            navigate(`/order-details?id=${id}`);
          });
        });

        tbody.querySelectorAll('button[data-action="investigate"]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            store.selectOrder(id);
            navigate(`/order-details?id=${id}`);
          });
        });
      }
    }

    // Mobile cards
    if (cardsContainer) {
      cardsContainer.innerHTML = filteredOrders.map(order => {
        const isHigh = order.riskLevel === 'HIGH';
        const isMed = order.riskLevel === 'MEDIUM';
        const badgeBg = isHigh ? 'bg-red-100 text-red-700' : (isMed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800');
        const accentBorder = isHigh ? 'border-l-red-500' : (isMed ? 'border-l-amber-500' : 'border-l-emerald-500');

        return `
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3 shadow-xs border-l-4 ${accentBorder} cursor-pointer" data-id="${order.id}">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono-data font-bold text-primary text-sm">${order.code}</span>
                  <span class="text-xs text-on-surface-variant">• ${order.customer.name}</span>
                </div>
                <h4 class="font-semibold text-sm text-on-surface mt-1">${order.product.name}</h4>
              </div>
              <span class="font-mono-data font-bold text-sm text-on-surface">${formatINR(order.value)}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-outline-variant/60">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${badgeBg}">
                  ${order.returnProbability}% Risk
                </span>
                <span class="text-xs text-on-surface-variant">${order.product.category}</span>
              </div>
              <span class="text-xs font-semibold text-primary flex items-center gap-0.5">
                Investigate <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </div>
        `;
      }).join('');

      cardsContainer.querySelectorAll('[data-id]').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-id');
          store.selectOrder(id);
          navigate(`/order-details?id=${id}`);
        });
      });
    }
  }

  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-container-max mx-auto">
      <!-- Title & KPI summary -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <p class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Real-Time Risk Feed</p>
          <h2 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">Order Monitoring</h2>
          <p class="font-body-lg text-sm text-on-surface-variant">Live surveillance of incoming e-commerce orders evaluated by the AI Return-Risk engine.</p>
        </div>
        <div class="flex items-center gap-3">
          <span id="orders-filtered-count" class="font-mono-data text-xs px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-semibold">
            ${store.orders.length} Orders Monitored
          </span>
        </div>
      </div>

      <!-- Search, Filter & Risk Tabs -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <!-- Search Bar -->
          <div class="md:col-span-6 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              id="input-orders-search"
              type="text" 
              value="${store.searchQuery}"
              class="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Search Order ID, Customer Name, Category, SKU..."
            />
          </div>

          <!-- Category Filter -->
          <div class="md:col-span-3">
            <select 
              id="select-category-filter"
              class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="ALL" ${store.filterCategory === 'ALL' ? 'selected' : ''}>All Product Categories</option>
              <option value="Apparel" ${store.filterCategory === 'Apparel' ? 'selected' : ''}>Apparel</option>
              <option value="Footwear" ${store.filterCategory === 'Footwear' ? 'selected' : ''}>Footwear</option>
              <option value="Electronics" ${store.filterCategory === 'Electronics' ? 'selected' : ''}>Electronics</option>
              <option value="Furniture & Home" ${store.filterCategory === 'Furniture & Home' ? 'selected' : ''}>Furniture &amp; Home</option>
              <option value="Personal Care" ${store.filterCategory === 'Personal Care' ? 'selected' : ''}>Personal Care</option>
            </select>
          </div>

          <!-- Quick Risk Filter Buttons -->
          <div class="md:col-span-3 flex items-center gap-1.5 p-1 bg-surface rounded-lg border border-outline-variant">
            <button data-risk="ALL" class="flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors ${store.filterRisk === 'ALL' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}">All</button>
            <button data-risk="HIGH" class="flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors ${store.filterRisk === 'HIGH' ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50'}">High</button>
            <button data-risk="MEDIUM" class="flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors ${store.filterRisk === 'MEDIUM' ? 'bg-amber-500 text-white' : 'text-amber-700 hover:bg-amber-50'}">Med</button>
            <button data-risk="LOW" class="flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors ${store.filterRisk === 'LOW' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'}">Low</button>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
                <th class="p-4 font-semibold">Order ID</th>
                <th class="p-4 font-semibold">Customer</th>
                <th class="p-4 font-semibold">Product &amp; Category</th>
                <th class="p-4 font-semibold">Order Value</th>
                <th class="p-4 font-semibold">Cust. Return History</th>
                <th class="p-4 font-semibold">Return Prob.</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody id="orders-table-body" class="font-body-md text-sm text-on-surface divide-y divide-outline-variant/60">
              <!-- Populated by updateTable() -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards Grid -->
      <div id="orders-mobile-cards" class="md:hidden flex flex-col gap-3">
        <!-- Populated by updateTable() -->
      </div>
    </div>
  `;

  // Search input handler
  const searchInput = container.querySelector('#input-orders-search');
  searchInput.addEventListener('input', (e) => {
    store.searchQuery = e.target.value;
    updateTable();
  });

  // Category select handler
  const categorySelect = container.querySelector('#select-category-filter');
  categorySelect.addEventListener('change', (e) => {
    store.filterCategory = e.target.value;
    updateTable();
  });

  // Risk filter buttons
  container.querySelectorAll('button[data-risk]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.filterRisk = btn.getAttribute('data-risk');
      container.querySelectorAll('button[data-risk]').forEach(b => {
        const r = b.getAttribute('data-risk');
        if (r === store.filterRisk) {
          if (r === 'ALL') b.className = 'flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors bg-primary text-on-primary';
          if (r === 'HIGH') b.className = 'flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors bg-red-600 text-white';
          if (r === 'MEDIUM') b.className = 'flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors bg-amber-500 text-white';
          if (r === 'LOW') b.className = 'flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors bg-emerald-600 text-white';
        } else {
          if (r === 'ALL') b.className = 'flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors text-on-surface-variant hover:bg-surface-container';
          if (r === 'HIGH') b.className = 'flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors text-red-600 hover:bg-red-50';
          if (r === 'MEDIUM') b.className = 'flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors text-amber-700 hover:bg-amber-50';
          if (r === 'LOW') b.className = 'flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors text-emerald-700 hover:bg-emerald-50';
        }
      });
      updateTable();
    });
  });

  updateTable();
}
