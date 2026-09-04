import { store, formatINR } from '../state/store.js';

export function initAIAssistant() {
  const assistantContainer = document.createElement('div');
  assistantContainer.id = 'ai-assistant-root';
  document.body.appendChild(assistantContainer);

  let isOpen = false;
  let chatHistory = [
    {
      sender: "ai",
      text: "Hello! I am PayNova AI Assistant. I can explain why an order is flagged, summarize customer return history, break down category risk factors, and calculate estimated revenue at risk."
    }
  ];

  function getContextualAnswer(question) {
    const order = store.getActiveOrder();
    const q = question.toLowerCase();

    if (q.includes("why") || q.includes("likely to be returned") || q.includes("risk factors")) {
      const topFactors = order.factors.map(f => `• ${f.name} (${f.impact})`).join('\n');
      return `For **Order ${order.code}** (${order.customer.name}), the PayNova Return-Risk model evaluated an **${order.returnProbability}% Return Probability** (${order.riskLevel} Risk).

Key contributing risk factors:
${topFactors}

**Summary:** The combination of customer historical return propensity (${order.customer.returnRate}%) and product category baseline (${order.product.categoryReturnRate}%) creates a statistically high return likelihood.`;
    }

    if (q.includes("summarize") || q.includes("summary")) {
      return `**Order Summary for ${order.code}:**
• **Customer:** ${order.customer.name} (${order.customer.location})
• **Product:** ${order.product.name} (${order.product.category})
• **Order Value:** ${formatINR(order.value)}
• **Payment Method:** ${order.paymentMethod}
• **Return Probability:** ${order.returnProbability}% (${order.riskLevel} Risk)
• **Revenue at Risk:** ${formatINR(order.revenueAtRisk)}
• **Current Status:** ${order.status}`;
    }

    if (q.includes("customer") || q.includes("history")) {
      return `**Customer Profile: ${order.customer.name} (${order.customer.id})**
• **Total Orders:** ${order.customer.totalOrders}
• **Past Returns:** ${order.customer.totalReturns}
• **Historical Return Rate:** ${order.customer.returnRate}% (Store benchmark is 12.4%)
• **Archetype:** ${order.customer.segment}
• **Notes:** ${order.customer.notes}`;
    }

    if (q.includes("product") || q.includes("category")) {
      return `**Product & Category Analytics:**
• **Product:** ${order.product.name} (SKU: ${order.product.sku})
• **Category:** ${order.product.category} (Category Return Rate: ${order.product.categoryReturnRate}%)
• **Product-specific Return Rate:** ${order.product.productReturnRate}%
• **Common Reasons for Return:**
${order.product.commonReturnReasons.map(r => `  - ${r}`).join('\n')}`;
    }

    if (q.includes("revenue") || q.includes("money") || q.includes("loss")) {
      return `**Revenue at Risk Analysis for ${order.code}:**
• **Total Order Value:** ${formatINR(order.value)}
• **Return Probability:** ${order.returnProbability}%
• **Estimated Revenue at Risk:** **${formatINR(order.revenueAtRisk)}** (calculated as Order Value × Return Probability).
• **Recommended Action:** Execute pre-dispatch verification to avoid two-way forward & reverse logistics shipping fees.`;
    }

    if (q.includes("evidence")) {
      const evCount = order.evidence ? order.evidence.length : 0;
      return `**Supporting Evidence for ${order.code}:**
Currently ${evCount} document(s) attached:
${order.evidence && order.evidence.length > 0 
  ? order.evidence.map(e => `• ${e.title} (${e.file})`).join('\n') 
  : '• No evidence attached yet. You can attach delivery POD, order invoices, or customer sizing chat logs.'}

*Recommendation: For high-risk apparel/footwear, review size selection verification and courier tracking delivery status.*`;
    }

    // Default fallback
    return `Regarding **Order ${order.code}**: The PayNova Return-Risk Scorer assigned an **${order.returnProbability}% probability of return** with **${formatINR(order.revenueAtRisk)}** revenue exposure. You can explore the contributing factors in the Order Details view or execute merchant verification in the Investigation tab.`;
  }

  function render() {
    if (!store.isAuthenticated || window.location.hash.includes('login')) {
      assistantContainer.innerHTML = '';
      return;
    }

    const order = store.getActiveOrder();

    assistantContainer.innerHTML = `
      <!-- Floating Action Button (Bottom-Right) -->
      <div class="fixed bottom-5 right-5 z-50">
        <button 
          id="btn-toggle-assistant" 
          class="flex items-center gap-2.5 px-4 py-3 bg-primary text-on-primary rounded-full shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all transform hover:scale-105 cursor-pointer border border-primary/30"
          title="Open PayNova AI Assistant"
        >
          <span class="material-symbols-outlined text-[22px] animate-pulse">smart_toy</span>
          <span class="font-headline-sm text-xs font-bold tracking-wide">PayNova Assistant</span>
          ${isOpen ? '<span class="material-symbols-outlined text-[18px]">close</span>' : ''}
        </button>
      </div>

      <!-- Slide-Out Assistant Panel -->
      <div id="assistant-drawer" class="${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'} fixed bottom-20 right-5 w-[380px] sm:w-[420px] max-w-[calc(100vw-40px)] h-[560px] max-h-[75vh] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 overflow-hidden">
        
        <!-- Header -->
        <div class="p-4 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div>
              <h3 class="font-headline-sm text-xs font-bold text-on-surface">PayNova Assistant</h3>
              <div class="text-[10px] font-mono text-on-surface-variant flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active on Order #${order.id}
              </div>
            </div>
          </div>
          <button id="btn-close-assistant" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Non-Autonomous Governance Banner -->
        <div class="px-3 py-1.5 bg-amber-50/80 border-b border-amber-200/80 text-[10px] text-amber-900 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[14px] text-amber-700">info</span>
          <span>Provides consultative risk explanations. Cannot cancel orders.</span>
        </div>

        <!-- Chat Message History -->
        <div id="assistant-chat-body" class="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs">
          ${chatHistory.map(msg => `
            <div class="flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}">
              <div class="max-w-[85%] p-3 rounded-xl ${
                msg.sender === 'user' 
                  ? 'bg-primary text-on-primary rounded-br-none' 
                  : 'bg-surface border border-outline-variant/60 text-on-surface rounded-bl-none font-sans'
              } leading-relaxed shadow-xs whitespace-pre-line">
                ${msg.text}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Suggested Prompt Chips -->
        <div class="px-3 py-2 bg-surface border-t border-outline-variant/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
          <button data-chip="Why is this order likely to be returned?" class="chip-btn px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap border border-outline-variant/40 shrink-0 font-medium">Why high risk?</button>
          <button data-chip="Summarize this order." class="chip-btn px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap border border-outline-variant/40 shrink-0 font-medium">Summarize</button>
          <button data-chip="What is the customer's return history?" class="chip-btn px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap border border-outline-variant/40 shrink-0 font-medium">Customer History</button>
          <button data-chip="How much revenue is at risk?" class="chip-btn px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap border border-outline-variant/40 shrink-0 font-medium">Revenue at Risk (₹)</button>
          <button data-chip="What evidence should I review?" class="chip-btn px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap border border-outline-variant/40 shrink-0 font-medium">Evidence</button>
        </div>

        <!-- Input Box -->
        <form id="assistant-input-form" class="p-3 bg-surface-container-low border-t border-outline-variant flex items-center gap-2">
          <input 
            id="assistant-input-text" 
            type="text" 
            placeholder="Ask about this order's return risk..." 
            class="flex-1 py-2 px-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary"
          />
          <button type="submit" class="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors shrink-0">
            <span class="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      </div>
    `;

    // Listeners
    const btnToggle = assistantContainer.querySelector('#btn-toggle-assistant');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        isOpen = !isOpen;
        render();
      });
    }

    const btnClose = assistantContainer.querySelector('#btn-close-assistant');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        isOpen = false;
        render();
      });
    }

    // Suggested Chips
    assistantContainer.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-chip');
        handleUserMessage(text);
      });
    });

    // Form submit
    const form = assistantContainer.querySelector('#assistant-input-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = assistantContainer.querySelector('#assistant-input-text');
        if (input && input.value.trim()) {
          handleUserMessage(input.value.trim());
          input.value = "";
        }
      });
    }

    // Scroll chat to bottom
    const chatBody = assistantContainer.querySelector('#assistant-chat-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  function handleUserMessage(msgText) {
    chatHistory.push({ sender: "user", text: msgText });
    const reply = getContextualAnswer(msgText);
    setTimeout(() => {
      chatHistory.push({ sender: "ai", text: reply });
      render();
    }, 200);
    render();
  }

  // Subscribe to order selection changes
  store.subscribe(() => {
    if (isOpen) render();
  });

  render();
}
