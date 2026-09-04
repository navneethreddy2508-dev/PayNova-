function getAPIBaseURL() {
  // 1. Explicit environment/window override
  if (typeof window !== 'undefined' && window.PAYNOVA_API_URL) {
    return window.PAYNOVA_API_URL;
  }

  // 2. Browser context detection
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const origin = window.location.origin;

    // Local development (localhost, 127.0.0.1, or local dev port)
    if (port === '3000' || port === '5173' || hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname || 'localhost'}:8000/api`;
    }

    // Local LAN testing on port 3000 (e.g. 192.168.x.x:3000)
    if (port === '3000') {
      return `http://${hostname}:8000/api`;
    }

    // Cloud / Vercel deployment (same origin serverless route /api)
    if (origin && origin.startsWith('http')) {
      return `${origin}/api`;
    }
  }

  return 'http://localhost:8000/api';
}

async function fetchJSON(endpoint, options = {}) {
  const baseURL = getAPIBaseURL();
  const url = `${baseURL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.detail || `HTTP error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Network request failed'))) {
      const detailedMsg = `Cannot reach PayNova backend at ${baseURL}. Please ensure the FastAPI backend is running on port 8000 (uvicorn backend.main:app --port 8000).`;
      console.error(`[API Client] ${detailedMsg}`);
      throw new Error(detailedMsg);
    }
    console.warn(`[API Client] Network request to '${endpoint}' failed:`, err.message);
    throw err;
  }
}

export const ReturnRiskAPI = {
  // 1. Predictions
  async predictReturnRisk(orderPayload) {
    return await fetchJSON('/return-risk/predict', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  },

  // 2. Orders
  async getOrders(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.category && params.category !== 'ALL') searchParams.append('category', params.category);
    if (params.risk_level && params.risk_level !== 'ALL') searchParams.append('risk_level', params.risk_level);
    if (params.min_value !== undefined) searchParams.append('min_value', params.min_value);
    if (params.max_value !== undefined) searchParams.append('max_value', params.max_value);
    if (params.page) searchParams.append('page', params.page);
    if (params.page_size) searchParams.append('page_size', params.page_size);

    const queryStr = searchParams.toString();
    const endpoint = `/orders${queryStr ? '?' + queryStr : ''}`;
    return await fetchJSON(endpoint);
  },

  async getOrderDetail(orderId) {
    return await fetchJSON(`/orders/${orderId}`);
  },

  async createOrder(orderData) {
    return await fetchJSON('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // 3. Dashboard
  async getDashboardSummary() {
    return await fetchJSON('/dashboard/summary');
  },

  // 4. Customers & Products
  async getCustomer(customerId) {
    return await fetchJSON(`/customers/${customerId}`);
  },

  async getProducts() {
    return await fetchJSON('/products');
  },

  async getProductDetail(productId) {
    return await fetchJSON(`/products/${productId}`);
  },

  async getCategoryAnalytics() {
    return await fetchJSON('/analytics/categories');
  },

  // 5. Interventions & Merchant Review Workflow
  async submitIntervention(payload) {
    return await fetchJSON('/interventions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getIntervention(orderId) {
    return await fetchJSON(`/interventions/${orderId}`);
  },

  // 6. Audit Trail
  async getAuditEvents(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.order_id) searchParams.append('order_id', params.order_id);
    if (params.action_type) searchParams.append('action_type', params.action_type);
    if (params.limit) searchParams.append('limit', params.limit);

    const queryStr = searchParams.toString();
    const endpoint = `/audit-events${queryStr ? '?' + queryStr : ''}`;
    return await fetchJSON(endpoint);
  },

  // 7. Model Performance & Diagnostics
  async getModelInfo() {
    return await fetchJSON('/model');
  },

  // 8. Settings
  async getSettings() {
    return await fetchJSON('/settings');
  },

  async updateSettings(settingsPayload) {
    return await fetchJSON('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsPayload)
    });
  },

  // 9. Evidence Upload
  async uploadEvidence(orderId, formData) {
    const url = `${getAPIBaseURL()}/orders/${orderId}/evidence`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed with status ${response.status}`);
    }
    return await response.json();
  }
};
