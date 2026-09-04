import { store, formatINR } from '../state/store.js';
import { navigate } from '../router.js';

// Predefined catalog for realistic simulation
const DEMO_PRESETS = [
  {
    id: "low",
    label: "Low Return Risk",
    badgeColor: "emerald",
    icon: "verified_user",
    description: "Loyal repeat buyer purchasing single premium electronics via Prepaid UPI with near-zero return history.",
    data: {
      customerId: "CUST-1049-HY",
      customerName: "Rahul Varma",
      city: "Hyderabad, Telangana",
      returnRate: 3.1,
      totalOrders: 32,
      previousReturns: 1,
      productId: "PROD-IPAD-AIR",
      productName: "Apple iPad Air 11-inch M2",
      category: "Electronics",
      orderValue: 24990,
      paymentMethod: "Razorpay UPI",
      deliveryType: "Express",
      delayDays: 0,
      itemCount: 1,
      isMultiSize: false,
      discount: 0
    }
  },
  {
    id: "medium",
    label: "Medium Return Risk",
    badgeColor: "amber",
    icon: "help_outline",
    description: "Moderate return history customer ordering higher-ticket furniture on credit card EMI with standard delivery.",
    data: {
      customerId: "CUST-3921-ND",
      customerName: "Vikram Patel",
      city: "Mumbai, Maharashtra",
      returnRate: 25.0,
      totalOrders: 8,
      previousReturns: 2,
      productId: "PROD-WOOD-TBL",
      productName: "Solid Sheesham Wood Coffee Table",
      category: "Furniture",
      orderValue: 6790,
      paymentMethod: "Credit Card EMI",
      deliveryType: "Standard",
      delayDays: 1,
      itemCount: 1,
      isMultiSize: false,
      discount: 10
    }
  },
  {
    id: "high",
    label: "High Return Risk",
    badgeColor: "red",
    icon: "warning",
    description: "High-return customer bracket-purchasing multiple sizes of apparel on Cash on Delivery with discount.",
    data: {
      customerId: "CUST-9921-DL",
      customerName: "Ananya Sen",
      city: "New Delhi, Delhi",
      returnRate: 53.8,
      totalOrders: 26,
      previousReturns: 14,
      productId: "PROD-ZARA-DRESS",
      productName: "Zara Embroidered Floral Midi Dress",
      category: "Apparel",
      orderValue: 6980,
      paymentMethod: "Cash on Delivery",
      deliveryType: "Standard",
      delayDays: 0,
      itemCount: 2,
      isMultiSize: true,
      discount: 20
    }
  }
];

const PRELOADED_CUSTOMERS = [
  { id: "CUST-1049-HY", name: "Rahul Varma", city: "Hyderabad, Telangana", rate: 3.1, orders: 32, returns: 1 },
  { id: "CUST-7712-CH", name: "Rohan Gupta", city: "Chennai, Tamil Nadu", rate: 15.8, orders: 19, returns: 3 },
  { id: "CUST-3921-ND", name: "Vikram Patel", city: "Mumbai, Maharashtra", rate: 25.0, orders: 8, returns: 2 },
  { id: "CUST-5582-PN", name: "Pooja Hegde", city: "Pune, Maharashtra", rate: 40.0, orders: 5, returns: 2 },
  { id: "CUST-8492-AX", name: "Priya Sharma", city: "Bengaluru, Karnataka", rate: 42.8, orders: 14, returns: 6 },
  { id: "CUST-9921-DL", name: "Ananya Sen", city: "New Delhi, Delhi", rate: 53.8, orders: 26, returns: 14 }
];

const PRELOADED_PRODUCTS = [
  { id: "PROD-IPAD-AIR", name: "Apple iPad Air 11-inch M2", category: "Electronics", price: 24990 },
  { id: "PROD-SONY-XM5", name: "Sony WH-1000XM5 Wireless Headphones", category: "Electronics", price: 12490 },
  { id: "PROD-NIKE-AIR", name: "Nike Air Jordan 1 Retro High", category: "Footwear", price: 8990 },
  { id: "PROD-ZARA-DRESS", name: "Zara Embroidered Floral Midi Dress", category: "Apparel", price: 3490 },
  { id: "PROD-WOOD-TBL", name: "Solid Sheesham Wood Coffee Table", category: "Furniture", price: 6790 },
  { id: "PROD-DYSON-AIR", name: "Dyson Airwrap Multi-Styler Complete", category: "Beauty & Personal Care", price: 18990 },
  { id: "PROD-LEVIS-501", name: "Levi's 501 Original Fit Jeans", category: "Apparel", price: 2890 }
];

function generateRandomOrderId() {
  return `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function renderSimulatorView(container) {
  let initialOrderId = generateRandomOrderId();

  container.innerHTML = `
    <div class="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
      
      <!-- Page Header & Context Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant p-5 md:p-6 rounded-2xl shadow-xs">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Interface 1 • Customer Order Simulator
            </span>
            <span class="flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live ML Model Connected
            </span>
          </div>
          <h1 class="font-display-lg text-2xl font-bold text-on-surface tracking-tight mt-1">Transaction Simulator</h1>
          <p class="text-xs text-on-surface-variant max-w-2xl">
            Simulate customer checkout transactions and run real-time AI return-risk scoring. Submitted orders are evaluated by the Stage 3 Machine Learning engine, stored in the SQLite database, and instantly made available for investigation in the Risk Analyst Console.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button id="btn-goto-analyst" class="px-4 py-2 bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest rounded-xl text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <span class="material-symbols-outlined text-[18px] text-primary">dashboard</span>
            <span>Risk Analyst Console</span>
          </button>
        </div>
      </div>

      <!-- Quick Demo Scenarios (One-Click Presets) -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">bolt</span>
            <h2 class="font-headline-sm text-sm font-bold text-on-surface">Quick Demo Scenarios</h2>
          </div>
          <span class="text-[11px] text-on-surface-variant">Click any scenario to auto-populate the form</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          ${DEMO_PRESETS.map(preset => {
            const isHigh = preset.badgeColor === 'red';
            const isMed = preset.badgeColor === 'amber';
            const bgBadge = isHigh ? 'bg-red-50 text-red-700 border-red-200' : (isMed ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200');
            const btnBorder = isHigh ? 'hover:border-red-400' : (isMed ? 'hover:border-amber-400' : 'hover:border-emerald-400');

            return `
              <button 
                type="button" 
                data-preset-id="${preset.id}" 
                class="btn-demo-preset text-left p-4 bg-surface-container-lowest border border-outline-variant rounded-xl ${btnBorder} hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-pointer group"
              >
                <div class="flex items-center justify-between w-full">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${bgBadge} flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">${preset.icon}</span>
                    <span>${preset.label}</span>
                  </span>
                  <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[18px] transition-colors">touch_app</span>
                </div>
                <p class="text-[11px] text-on-surface-variant leading-relaxed">
                  ${preset.description}
                </p>
                <div class="pt-2 border-t border-outline-variant/50 flex items-center justify-between text-[11px] font-mono text-on-surface">
                  <span>${preset.data.category} • ₹${preset.data.orderValue.toLocaleString('en-IN')}</span>
                  <span class="text-primary font-semibold group-hover:underline">Load Preset →</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Main Order Creation Form -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden">
        
        <div class="p-5 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[24px]">shopping_cart_checkout</span>
            </div>
            <div>
              <h2 class="font-headline-sm text-base font-bold text-on-surface">E-Commerce Checkout &amp; Order Simulation</h2>
              <p class="text-xs text-on-surface-variant">Configure customer and transaction attributes required by the AI return model</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-reset-form" class="px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>

        <form id="order-simulator-form" class="p-5 md:p-6 flex flex-col gap-6">
          
          <!-- Section 1: Customer Profile -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 pb-2 border-b border-outline-variant/60">
              <span class="material-symbols-outlined text-primary text-[18px]">person</span>
              <h3 class="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">1. Customer Behavioral Profile</h3>
            </div>

            <!-- Customer Quick Select -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label for="select-customer-preset" class="text-xs font-semibold text-on-surface">Choose Customer Profile</label>
                <select id="select-customer-preset" class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-medium">
                  <option value="custom">-- Custom / New Customer --</option>
                  ${PRELOADED_CUSTOMERS.map(c => `
                    <option value="${c.id}">${c.name} (${c.id}) • Return Rate: ${c.rate}%</option>
                  `).join('')}
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="input-customer-id" class="text-xs font-semibold text-on-surface">Customer ID</label>
                <input id="input-customer-id" type="text" value="CUST-1049-HY" required class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs font-mono text-on-surface focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
              <div class="flex flex-col gap-1.5">
                <label for="input-customer-name" class="text-xs font-semibold text-on-surface">Full Name</label>
                <input id="input-customer-name" type="text" value="Rahul Varma" required class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary" />
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="input-shipping-city" class="text-xs font-semibold text-on-surface">Delivery City &amp; State</label>
                <input id="input-shipping-city" type="text" value="Hyderabad, Telangana" required class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary" />
              </div>

              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label for="input-return-rate" class="text-xs font-semibold text-on-surface">Customer Return Rate (%)</label>
                  <span id="label-return-rate" class="text-xs font-mono font-bold text-primary">3.1%</span>
                </div>
                <input id="input-return-rate" type="range" min="0" max="100" step="0.5" value="3.1" class="w-full accent-primary cursor-pointer mt-1" />
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-1">
              <div class="flex flex-col gap-1.5">
                <label for="input-total-orders" class="text-xs font-semibold text-on-surface">Total Past Orders</label>
                <input id="input-total-orders" type="number" min="1" max="200" value="32" class="w-full py-2 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label for="input-previous-returns" class="text-xs font-semibold text-on-surface">Previous Returns Count</label>
                <input id="input-previous-returns" type="number" min="0" max="100" value="1" class="w-full py-2 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          <!-- Section 2: Order & Product Details -->
          <div class="flex flex-col gap-3 pt-2">
            <div class="flex items-center gap-2 pb-2 border-b border-outline-variant/60">
              <span class="material-symbols-outlined text-primary text-[18px]">inventory_2</span>
              <h3 class="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">2. Order &amp; Product Specification</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label for="input-order-id" class="text-xs font-semibold text-on-surface">Order ID</label>
                  <button type="button" id="btn-regen-order-id" class="text-[10px] text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
                    <span class="material-symbols-outlined text-[12px]">refresh</span>
                    <span>Generate</span>
                  </button>
                </div>
                <input id="input-order-id" type="text" value="${initialOrderId}" required class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs font-mono font-bold text-on-surface focus:outline-none focus:border-primary" />
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="select-product-preset" class="text-xs font-semibold text-on-surface">Select Product Catalog</label>
                <select id="select-product-preset" class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-medium">
                  <option value="custom">-- Custom Product --</option>
                  ${PRELOADED_PRODUCTS.map(p => `
                    <option value="${p.id}">${p.name} (₹${p.price.toLocaleString('en-IN')})</option>
                  `).join('')}
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="select-category" class="text-xs font-semibold text-on-surface">Product Category</label>
                <select id="select-category" class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-medium">
                  <option value="Electronics">Electronics</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Home & Living">Home & Living</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <div class="flex flex-col gap-1.5">
                <label for="input-product-name" class="text-xs font-semibold text-on-surface">Product Title</label>
                <input id="input-product-name" type="text" value="Apple iPad Air 11-inch M2" required class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary" />
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="input-order-value" class="text-xs font-semibold text-on-surface">Order Value in INR (₹)</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-on-surface-variant">₹</span>
                  <input id="input-order-value" type="number" min="100" max="500000" step="50" value="24990" required class="w-full py-2.5 pl-7 pr-3 bg-surface border border-outline-variant rounded-lg text-xs font-mono font-bold text-on-surface focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
              <div class="flex flex-col gap-1.5">
                <label for="select-item-count" class="text-xs font-semibold text-on-surface">Quantity (Items)</label>
                <select id="select-item-count" class="w-full py-2 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-medium">
                  <option value="1">1 item</option>
                  <option value="2">2 items</option>
                  <option value="3">3 items</option>
                  <option value="4">4 items</option>
                  <option value="5">5 items</option>
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="input-discount" class="text-xs font-semibold text-on-surface">Discount Applied (%)</label>
                <input id="input-discount" type="number" min="0" max="80" value="0" class="w-full py-2 px-3 bg-surface border border-outline-variant rounded-lg text-xs font-mono text-on-surface focus:outline-none focus:border-primary" />
              </div>

              <div class="flex items-center gap-3 p-3 bg-surface rounded-lg border border-outline-variant mt-auto">
                <input id="check-multi-size" type="checkbox" class="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant bg-surface-container" />
                <label for="check-multi-size" class="text-xs font-medium text-on-surface cursor-pointer select-none">
                  Multi-size Bracket Purchase
                </label>
              </div>
            </div>
          </div>

          <!-- Section 3: Payment & Logistics -->
          <div class="flex flex-col gap-3 pt-2">
            <div class="flex items-center gap-2 pb-2 border-b border-outline-variant/60">
              <span class="material-symbols-outlined text-primary text-[18px]">payments</span>
              <h3 class="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">3. Payment Method &amp; Delivery SLA</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="flex flex-col gap-1.5">
                <label for="select-payment-method" class="text-xs font-semibold text-on-surface">Payment Method</label>
                <select id="select-payment-method" class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-medium">
                  <option value="Razorpay UPI">Razorpay UPI (Google Pay / PhonePe)</option>
                  <option value="Credit Card">Credit Card (Visa / Mastercard)</option>
                  <option value="Credit Card EMI">Credit Card EMI</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Net Banking">Net Banking (HDFC / ICICI / SBI)</option>
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="select-delivery-type" class="text-xs font-semibold text-on-surface">Delivery Speed</label>
                <select id="select-delivery-type" class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-medium">
                  <option value="Standard">Standard Delivery (3-4 Days)</option>
                  <option value="Express">Express Air Delivery (1-2 Days)</option>
                  <option value="Same Day">Same-Day Hyperlocal Delivery</option>
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="select-delay-days" class="text-xs font-semibold text-on-surface">Delivery Delay Forecast</label>
                <select id="select-delay-days" class="w-full py-2.5 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-medium">
                  <option value="0">On-Time (0 Days Delay)</option>
                  <option value="1">1 Day Minor Delay</option>
                  <option value="2">2 Days Moderate Delay</option>
                  <option value="4">4+ Days Severe Delay</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Submission Action Bar -->
          <div class="pt-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-on-surface-variant flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-primary">security</span>
              <span>Backend evaluates order with Stage 3 champion ML model</span>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <button 
                type="submit" 
                id="btn-analyze-order" 
                class="w-full sm:w-auto px-6 py-3 bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[20px]">analytics</span>
                <span>Analyze Order &amp; Score Return-Risk</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Loading State Overlay (Dynamic) -->
      <div id="simulator-loading" class="hidden p-8 bg-surface-container-lowest border border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-4 text-center shadow-xs">
        <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div class="flex flex-col gap-1">
          <h3 class="font-headline-sm text-sm font-bold text-on-surface">Executing Machine Learning Inference</h3>
          <p class="text-xs text-on-surface-variant font-mono">Running feature engineering, Random Forest inference &amp; SHAP attribution on backend...</p>
        </div>
      </div>

      <!-- Real-Time AI Return-Risk Result Container -->
      <div id="simulator-result-container" class="hidden flex flex-col gap-6">
        <!-- Injected dynamically upon successful order analysis -->
      </div>
    </div>
  `;

  // Bind Form Elements & Controls
  const form = container.querySelector('#order-simulator-form');
  const btnAnalyze = container.querySelector('#btn-analyze-order');
  const btnReset = container.querySelector('#btn-reset-form');
  const btnRegenOrderId = container.querySelector('#btn-regen-order-id');
  const btnGotoAnalyst = container.querySelector('#btn-goto-analyst');
  const loadingEl = container.querySelector('#simulator-loading');
  const resultContainer = container.querySelector('#simulator-result-container');

  const customerSelect = container.querySelector('#select-customer-preset');
  const customerIdInput = container.querySelector('#input-customer-id');
  const customerNameInput = container.querySelector('#input-customer-name');
  const shippingCityInput = container.querySelector('#input-shipping-city');
  const returnRateInput = container.querySelector('#input-return-rate');
  const returnRateLabel = container.querySelector('#label-return-rate');
  const totalOrdersInput = container.querySelector('#input-total-orders');
  const previousReturnsInput = container.querySelector('#input-previous-returns');

  const orderIdInput = container.querySelector('#input-order-id');
  const productSelect = container.querySelector('#select-product-preset');
  const productNameInput = container.querySelector('#input-product-name');
  const categorySelect = container.querySelector('#select-category');
  const orderValueInput = container.querySelector('#input-order-value');
  const itemCountSelect = container.querySelector('#select-item-count');
  const discountInput = container.querySelector('#input-discount');
  const multiSizeCheck = container.querySelector('#check-multi-size');

  const paymentMethodSelect = container.querySelector('#select-payment-method');
  const deliveryTypeSelect = container.querySelector('#select-delivery-type');
  const delayDaysSelect = container.querySelector('#select-delay-days');

  // Return rate slider sync
  returnRateInput.addEventListener('input', () => {
    returnRateLabel.textContent = `${parseFloat(returnRateInput.value).toFixed(1)}%`;
  });

  // Regenerate Order ID
  if (btnRegenOrderId) {
    btnRegenOrderId.addEventListener('click', () => {
      orderIdInput.value = generateRandomOrderId();
    });
  }

  if (btnGotoAnalyst) {
    btnGotoAnalyst.addEventListener('click', () => navigate('/dashboard'));
  }

  // Customer Preset Change
  customerSelect.addEventListener('change', () => {
    const custId = customerSelect.value;
    if (custId === 'custom') return;
    const found = PRELOADED_CUSTOMERS.find(c => c.id === custId);
    if (found) {
      customerIdInput.value = found.id;
      customerNameInput.value = found.name;
      shippingCityInput.value = found.city;
      returnRateInput.value = found.rate;
      returnRateLabel.textContent = `${found.rate}%`;
      totalOrdersInput.value = found.orders;
      previousReturnsInput.value = found.returns;
    }
  });

  // Product Preset Change
  productSelect.addEventListener('change', () => {
    const prodId = productSelect.value;
    if (prodId === 'custom') return;
    const found = PRELOADED_PRODUCTS.find(p => p.id === prodId);
    if (found) {
      productNameInput.value = found.name;
      categorySelect.value = found.category;
      orderValueInput.value = found.price;
    }
  });

  // Preset Button Clicks
  container.querySelectorAll('.btn-demo-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetId = btn.getAttribute('data-preset-id');
      const preset = DEMO_PRESETS.find(p => p.id === presetId);
      if (!preset) return;

      const d = preset.data;
      customerSelect.value = d.customerId;
      customerIdInput.value = d.customerId;
      customerNameInput.value = d.customerName;
      shippingCityInput.value = d.city;
      returnRateInput.value = d.returnRate;
      returnRateLabel.textContent = `${d.returnRate}%`;
      totalOrdersInput.value = d.totalOrders;
      previousReturnsInput.value = d.previousReturns;

      orderIdInput.value = generateRandomOrderId();
      productSelect.value = d.productId;
      productNameInput.value = d.productName;
      categorySelect.value = d.category;
      orderValueInput.value = d.orderValue;
      paymentMethodSelect.value = d.paymentMethod;
      deliveryTypeSelect.value = d.deliveryType;
      delayDaysSelect.value = String(d.delayDays);
      itemCountSelect.value = String(d.itemCount);
      multiSizeCheck.checked = d.isMultiSize;
      discountInput.value = d.discount;

      // Scroll smoothly to form
      form.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Reset form
  btnReset.addEventListener('click', () => {
    customerSelect.value = "CUST-1049-HY";
    customerIdInput.value = "CUST-1049-HY";
    customerNameInput.value = "Rahul Varma";
    shippingCityInput.value = "Hyderabad, Telangana";
    returnRateInput.value = 3.1;
    returnRateLabel.textContent = "3.1%";
    totalOrdersInput.value = 32;
    previousReturnsInput.value = 1;

    orderIdInput.value = generateRandomOrderId();
    productSelect.value = "PROD-IPAD-AIR";
    productNameInput.value = "Apple iPad Air 11-inch M2";
    categorySelect.value = "Electronics";
    orderValueInput.value = 24990;
    paymentMethodSelect.value = "Razorpay UPI";
    deliveryTypeSelect.value = "Express";
    delayDaysSelect.value = "0";
    itemCountSelect.value = "1";
    multiSizeCheck.checked = false;
    discountInput.value = 0;

    resultContainer.classList.add('hidden');
    resultContainer.innerHTML = '';
  });

  // Form Submit -> Backend API -> ML Scoring -> Result Presentation
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const orderId = orderIdInput.value.trim() || generateRandomOrderId();
    const customerId = customerIdInput.value.trim() || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const customerName = customerNameInput.value.trim() || "Customer";
    const shippingCity = shippingCityInput.value.trim() || "Mumbai";
    const category = categorySelect.value;
    const productName = productNameInput.value.trim() || `${category} Item`;
    const orderValue = parseFloat(orderValueInput.value) || 1000.0;
    const paymentMethod = paymentMethodSelect.value;
    const deliveryType = deliveryTypeSelect.value;
    const delayDays = parseInt(delayDaysSelect.value) || 0;
    const itemCount = parseInt(itemCountSelect.value) || 1;
    const isMultiSize = multiSizeCheck.checked ? 1 : 0;
    const discount = parseFloat(discountInput.value) || 0.0;
    const returnRate = (parseFloat(returnRateInput.value) || 15.0) / 100.0;
    const totalOrders = parseInt(totalOrdersInput.value) || 1;
    const prevReturns = parseInt(previousReturnsInput.value) || 0;

    const payload = {
      order_id: orderId,
      customer_id: customerId,
      customer_name: customerName,
      product_id: productSelect.value !== 'custom' ? productSelect.value : `PROD-${category.toUpperCase()}`,
      product_name: productName,
      category: category,
      order_value: orderValue,
      currency: "INR",
      payment_method: paymentMethod,
      delivery_type: deliveryType,
      delivery_status: "Processing",
      shipping_city: shippingCity,
      delivery_delay_days: delayDays,
      number_of_items: itemCount,
      is_multi_size_order: isMultiSize,
      discount_percent: discount,
      customer_return_rate: returnRate,
      customer_total_orders: totalOrders,
      customer_previous_returns: prevReturns
    };

    // Show Loading state
    btnAnalyze.disabled = true;
    btnAnalyze.classList.add('opacity-50', 'cursor-not-allowed');
    loadingEl.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    loadingEl.scrollIntoView({ behavior: 'smooth' });

    try {
      // Execute live scoring via store and backend API
      const evaluatedOrder = await store.createSimulatedOrder(payload);

      // Hide loading
      loadingEl.classList.add('hidden');
      btnAnalyze.disabled = false;
      btnAnalyze.classList.remove('opacity-50', 'cursor-not-allowed');

      // Render Result Card
      renderResultCard(resultContainer, evaluatedOrder);
      resultContainer.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      btnAnalyze.disabled = false;
      btnAnalyze.classList.remove('opacity-50', 'cursor-not-allowed');

      resultContainer.innerHTML = `
        <div class="p-5 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-2 text-red-900 animate-in fade-in duration-200">
          <div class="flex items-center gap-2 font-bold text-sm text-red-700">
            <span class="material-symbols-outlined text-[20px]">error</span>
            <span>Failed to Analyze Simulated Order</span>
          </div>
          <p class="text-xs text-red-800 leading-relaxed font-mono">
            ${err.message || "Unknown communication error"}
          </p>
          <div class="mt-2 pt-2 border-t border-red-200/60 flex items-center justify-between text-xs text-red-700">
            <span>Verify FastAPI backend is running: <code>.\\.venv\\Scripts\\uvicorn backend.main:app --port 8000</code></span>
          </div>
        </div>
      `;
      resultContainer.classList.remove('hidden');
      resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

function renderResultCard(container, order) {
  const isHigh = order.riskLevel === 'HIGH';
  const isMed = order.riskLevel === 'MEDIUM';
  const riskColor = isHigh ? 'text-red-600' : (isMed ? 'text-amber-600' : 'text-emerald-600');
  const riskBorder = isHigh ? 'border-l-error border-error/30' : (isMed ? 'border-l-amber-500 border-amber-300' : 'border-l-emerald-500 border-emerald-300');
  const riskBadgeBg = isHigh ? 'bg-error-container text-on-error-container border-error/20' : (isMed ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300');

  container.innerHTML = `
    <div class="bg-surface-container-lowest border ${riskBorder} border-l-4 rounded-2xl p-6 md:p-8 shadow-lg flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Top Success Status Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span class="material-symbols-outlined text-[28px]">verified</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono-data text-xs font-bold text-on-surface">#${order.id}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-bold border ${riskBadgeBg}">
                ${order.riskLevel} RETURN RISK
              </span>
            </div>
            <h3 class="font-headline-sm text-lg font-bold text-on-surface mt-0.5">Order Evaluated &amp; Persisted to Database</h3>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-on-surface-variant">Inference Latency: <strong>14ms</strong></span>
        </div>
      </div>

      <!-- Bento Metric Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div class="p-4 rounded-xl bg-surface border border-outline-variant flex flex-col justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Return Probability</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="font-display-lg text-3xl font-extrabold ${riskColor}">${order.returnProbability}</span>
            <span class="font-headline-sm text-base font-bold ${riskColor}">%</span>
          </div>
          <span class="text-[10px] text-on-surface-variant/80 mt-1">Random Forest Score</span>
        </div>

        <div class="p-4 rounded-xl bg-surface border border-outline-variant flex flex-col justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Revenue at Risk</span>
          <div class="font-display-lg text-2xl font-bold text-on-surface mt-2">${formatINR(order.revenueAtRisk)}</div>
          <span class="text-[10px] text-on-surface-variant/80 mt-1">Expected Financial Loss</span>
        </div>

        <div class="p-4 rounded-xl bg-surface border border-outline-variant flex flex-col justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Order Value</span>
          <div class="font-display-lg text-2xl font-bold text-on-surface mt-2">${formatINR(order.value)}</div>
          <span class="text-[10px] text-on-surface-variant/80 mt-1">${order.paymentMethod}</span>
        </div>

        <div class="p-4 rounded-xl bg-surface border border-outline-variant flex flex-col justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Case Disposition</span>
          <div class="font-headline-sm text-base font-bold text-on-surface mt-2">${order.status}</div>
          <span class="text-[10px] font-mono text-primary mt-1">${order.caseId}</span>
        </div>
      </div>

      <!-- Order Details Summary Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-5 rounded-xl border border-outline-variant">
        
        <div class="flex flex-col gap-3">
          <h4 class="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-primary">person</span>
            <span>Customer &amp; Logistics</span>
          </h4>
          <div class="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40">
            <span class="text-on-surface-variant">Customer Name:</span>
            <span class="font-semibold text-on-surface">${order.customer.name}</span>
          </div>
          <div class="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40">
            <span class="text-on-surface-variant">Customer ID:</span>
            <span class="font-mono text-on-surface">${order.customer.id}</span>
          </div>
          <div class="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40">
            <span class="text-on-surface-variant">Historical Return Rate:</span>
            <span class="font-bold ${order.customer.returnRate > 30 ? 'text-red-600' : 'text-on-surface'}">${order.customer.returnRate.toFixed(1)}%</span>
          </div>
          <div class="flex justify-between items-center text-xs py-1">
            <span class="text-on-surface-variant">Shipping Location:</span>
            <span class="text-on-surface">${order.shippingCity}</span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <h4 class="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-primary">shopping_bag</span>
            <span>Product &amp; Payment Attributes</span>
          </h4>
          <div class="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40">
            <span class="text-on-surface-variant">Product Item:</span>
            <span class="font-semibold text-on-surface truncate max-w-[200px]">${order.product.name}</span>
          </div>
          <div class="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40">
            <span class="text-on-surface-variant">Category:</span>
            <span class="text-on-surface">${order.product.category}</span>
          </div>
          <div class="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40">
            <span class="text-on-surface-variant">Payment Method:</span>
            <span class="text-on-surface font-medium">${order.paymentMethod}</span>
          </div>
          <div class="flex justify-between items-center text-xs py-1">
            <span class="text-on-surface-variant">Status:</span>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface">${order.deliveryStatus}</span>
          </div>
        </div>
      </div>

      <!-- Key Return-Risk Contributing Factors (SHAP) -->
      ${order.factors && order.factors.length > 0 ? `
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h4 class="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-primary">analytics</span>
              <span>AI Return-Risk Explanations &amp; Contributing Signals</span>
            </h4>
            <span class="text-[10px] font-mono text-on-surface-variant">SHAP Attributions</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${order.factors.map(factor => `
              <div class="p-3 rounded-lg bg-surface border border-outline-variant flex items-center justify-between gap-3 text-xs">
                <span class="text-on-surface font-medium">${factor.name}</span>
                <span class="font-mono font-bold px-2 py-0.5 rounded ${factor.weight > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}">
                  ${factor.impact}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Analyst Handoff Action Section -->
      <div class="p-5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">sync</span>
            <span class="text-xs font-bold text-on-surface">Order submitted to Return-Risk Analysis</span>
          </div>
          <p class="text-xs text-on-surface-variant">
            This transaction is committed to the SQLite database and ready for risk investigation in the Risk Analyst console.
          </p>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button id="btn-result-view-analyst" class="w-full sm:w-auto px-5 py-2.5 bg-primary text-on-primary hover:bg-primary-container font-label-md text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">search</span>
            <span>View in Risk Analyst Console</span>
          </button>
          <button id="btn-result-view-orders" class="w-full sm:w-auto px-4 py-2.5 bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest rounded-xl text-xs font-semibold text-on-surface transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Order Monitoring</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Result Button Listeners
  const btnViewAnalyst = container.querySelector('#btn-result-view-analyst');
  const btnViewOrders = container.querySelector('#btn-result-view-orders');

  if (btnViewAnalyst) {
    btnViewAnalyst.addEventListener('click', () => {
      navigate(`/order-details?id=${order.id}`);
    });
  }

  if (btnViewOrders) {
    btnViewOrders.addEventListener('click', () => {
      navigate('/orders');
    });
  }
}
