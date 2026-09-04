import {
  INITIAL_ORDERS,
  INITIAL_CASES,
  INITIAL_AUDIT_TRAIL,
  MODEL_STATS,
  ANALYTICS_DATA,
  DEFAULT_SETTINGS
} from '../data/mockData.js';
import { ReturnRiskAPI } from '../services/api.js';

export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Math.round(Number(amount));
  return '₹' + num.toLocaleString('en-IN');
}

export function formatCompactINR(amount) {
  if (!amount || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num >= 10000000) {
    return '₹' + (num / 10000000).toFixed(2) + ' Cr';
  }
  if (num >= 100000) {
    return '₹' + (num / 100000).toFixed(2) + ' L';
  }
  if (num >= 1000) {
    return '₹' + (num / 1000).toFixed(1) + 'k';
  }
  return '₹' + num.toLocaleString('en-IN');
}

class AppStateStore {
  constructor() {
    this.currentUser = {
      name: "Navneeth",
      email: "navneeth@paynova.ai",
      role: "Senior Risk Analyst",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    };
    
    // Check previous session auth (defaults to false for new users)
    const savedAuth = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('paynova_auth') : null;
    this.isAuthenticated = savedAuth === 'true';

    this.orders = [...INITIAL_ORDERS];
    this.cases = { ...INITIAL_CASES };
    this.auditTrail = [...INITIAL_AUDIT_TRAIL];
    this.modelStats = { ...MODEL_STATS };
    this.analytics = { ...ANALYTICS_DATA };
    this.settings = { ...DEFAULT_SETTINGS };
    
    this.activeOrderId = "8921";
    this.searchQuery = "";
    this.filterRisk = "ALL";
    this.filterCategory = "ALL";
    this.isBackendConnected = false;
    
    this.listeners = new Set();

    // Auto-sync with backend on client bootstrap
    this.syncWithBackend();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this);
      } catch (e) {
        console.error("Store listener error:", e);
      }
    });
  }

  async syncWithBackend() {
    try {
      // 1. Fetch Model Metrics
      const modelData = await ReturnRiskAPI.getModelInfo().catch(() => null);
      if (modelData) {
        this.modelStats = {
          ...this.modelStats,
          accuracy: modelData.accuracy,
          precision: modelData.precision,
          recall: modelData.recall,
          f1Score: modelData.f1Score,
          rocAuc: modelData.rocAuc,
          falsePositiveRate: modelData.falsePositiveRate,
          estFalsePositiveCost: modelData.estFalsePositiveCost,
          confusionMatrix: modelData.confusionMatrix,
          featureImportance: modelData.featureImportance
        };
        this.isBackendConnected = true;
      }

      // 2. Fetch Settings
      const settingsData = await ReturnRiskAPI.getSettings().catch(() => null);
      if (settingsData) {
        this.settings = {
          ...this.settings,
          highRiskThreshold: settingsData.highRiskThreshold,
          mediumRiskThreshold: settingsData.mediumRiskThreshold,
          lowRiskThreshold: settingsData.lowRiskThreshold,
          autoFlagOrdersAbove: settingsData.autoFlagOrdersAbove,
          enableRealtimeInference: settingsData.enableRealtimeInference,
          notifyHighRiskEmail: settingsData.notifyHighRiskEmail,
          notifySlackWebhook: settingsData.notifySlackWebhook
        };
      }

      // 3. Fetch Audit Trail
      const auditData = await ReturnRiskAPI.getAuditEvents().catch(() => null);
      if (Array.isArray(auditData) && auditData.length > 0) {
        this.auditTrail = auditData.map(a => ({
          id: a.event_id,
          timestamp: new Date(a.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          orderId: a.order_id || '-',
          event: a.event_name,
          returnProbability: a.return_probability,
          modelVersion: a.model_version,
          actor: a.actor,
          actionType: a.action_type,
          badgeColor: a.badge_color,
          details: a.details
        }));
      }

      if (this.isBackendConnected) {
        console.log("[Store] Successfully synced state with FastAPI backend at http://127.0.0.1:8000/api");
        this.notify();
      }
    } catch (err) {
      console.log("[Store] Backend unavailable, continuing in offline mock mode.");
    }
  }

  login(username, password) {
    const validUser = (username || '').trim() === 'Navneeth';
    const validPass = (password || '').trim() === '12345678';
    
    if (validUser && validPass) {
      this.isAuthenticated = true;
      this.currentUser.name = "Navneeth";
      this.currentUser.email = "navneeth@paynova.ai";
      try {
        sessionStorage.setItem('paynova_auth', 'true');
        sessionStorage.setItem('paynova_user', 'Navneeth');
      } catch (e) {}
      this.notify();
      return true;
    }
    return false;
  }

  logout() {
    this.isAuthenticated = false;
    try {
      sessionStorage.removeItem('paynova_auth');
      sessionStorage.removeItem('paynova_user');
    } catch (e) {}
    this.notify();
  }

  selectOrder(id) {
    this.activeOrderId = String(id);
    this.notify();
  }

  getActiveOrder() {
    return this.orders.find(o => String(o.id) === String(this.activeOrderId)) || this.orders[0];
  }

  getOrderById(id) {
    return this.orders.find(o => String(o.id) === String(id)) || null;
  }

  getCaseForOrder(orderId) {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    if (this.cases[order.caseId]) {
      return this.cases[order.caseId];
    }
    // Create lazy case if not exists
    const newCase = {
      caseId: `RR-${1000 + parseInt(orderId || '999')}`,
      orderId: order.id,
      status: order.riskLevel === 'HIGH' ? 'Open' : (order.riskLevel === 'MEDIUM' ? 'Under Review' : 'Monitored'),
      priority: order.riskLevel === 'HIGH' ? 'High' : (order.riskLevel === 'MEDIUM' ? 'Medium' : 'Low'),
      assignedTo: this.currentUser.name,
      createdAt: order.formattedDate,
      updatedAt: "Just now",
      merchantAction: "Pending Review",
      riskSummary: `Return probability ${order.returnProbability}% on ${order.product?.name || order.category}.`,
      notes: [
        { author: "AI System", date: order.formattedDate, text: `Auto-generated risk score ${order.returnProbability}/100.` }
      ]
    };
    this.cases[newCase.caseId] = newCase;
    order.caseId = newCase.caseId;
    return newCase;
  }

  async performMerchantAction(orderId, actionType, noteText = "") {
    const order = this.getOrderById(orderId);
    if (!order) return false;

    const caseObj = this.getCaseForOrder(orderId);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const fullTimestamp = `${dateStr}, ${timeStr}`;

    let statusUpdate = caseObj.status;
    let badgeColor = "blue";
    let eventName = `Merchant Review: ${actionType}`;
    let apiAction = "REVIEW";

    if (actionType === "Monitor Order") {
      statusUpdate = "Monitored";
      order.status = "Monitored";
      badgeColor = "emerald";
      apiAction = "MONITOR";
    } else if (actionType === "Request Verification") {
      statusUpdate = "Under Review";
      order.status = "Under Review";
      badgeColor = "amber";
      apiAction = "CUSTOMER_OUTREACH";
    } else if (actionType === "Flag for Review") {
      statusUpdate = "Open";
      order.status = "Flagged";
      badgeColor = "red";
      apiAction = "PREVENTIVE_ACTION";
    } else if (actionType === "Mark as Reviewed") {
      statusUpdate = "Resolved";
      order.status = "Reviewed";
      badgeColor = "emerald";
      apiAction = "RESOLVED";
    }

    caseObj.status = statusUpdate;
    caseObj.merchantAction = actionType;
    caseObj.updatedAt = fullTimestamp;

    if (noteText) {
      caseObj.notes.push({
        author: this.currentUser.name,
        date: fullTimestamp,
        text: noteText
      });
    }

    // Add local Audit Trail Entry
    const auditId = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
    this.auditTrail.unshift({
      id: auditId,
      timestamp: fullTimestamp,
      orderId: order.id,
      event: eventName,
      returnProbability: `${order.returnProbability}%`,
      modelVersion: this.modelStats.modelVersion,
      actor: `${this.currentUser.name} (Merchant Reviewer)`,
      actionType: "MERCHANT_ACTION",
      badgeColor: badgeColor,
      details: noteText || `Merchant executed action '${actionType}' on Order #${order.id}. Case status updated to '${statusUpdate}'.`
    });

    this.notify();

    // Async sync with FastAPI backend
    ReturnRiskAPI.submitIntervention({
      order_id: String(orderId),
      action: apiAction,
      reviewer: `${this.currentUser.name} (Merchant Reviewer)`,
      note_text: noteText || `Executed merchant action: ${actionType}`,
      status: statusUpdate
    }).catch(e => console.warn("[Store] Backend intervention submission notice:", e.message));

    return true;
  }

  attachEvidence(orderId, evidenceData) {
    const order = this.getOrderById(orderId);
    if (!order) return false;

    const evId = `EV-${Math.floor(10 + Math.random() * 90)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEvidence = {
      id: evId,
      title: evidenceData.title || "Supporting Attachment",
      type: evidenceData.type || "document",
      date: dateStr,
      file: evidenceData.fileName || "attachment.pdf"
    };

    if (!order.evidence) order.evidence = [];
    order.evidence.push(newEvidence);

    // Audit trail
    this.auditTrail.unshift({
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: `${dateStr}, ${timeStr}`,
      orderId: order.id,
      event: "Evidence Attached",
      returnProbability: `${order.returnProbability}%`,
      modelVersion: this.modelStats.modelVersion,
      actor: `${this.currentUser.name} (Analyst)`,
      actionType: "EVIDENCE_ADDED",
      badgeColor: "blue",
      details: `Attached ${newEvidence.type.toUpperCase()} evidence: '${newEvidence.title}' (${newEvidence.file}).`
    });

    this.notify();
    return true;
  }

  async createSimulatedOrder(orderPayload) {
    try {
      const response = await ReturnRiskAPI.createOrder(orderPayload);
      
      // Transform API response to client order structure
      const newOrder = {
        id: response.id,
        code: response.code || `#ORD-${response.id.replace('ORD-', '')}`,
        customer: {
          id: response.customer?.customer_id || orderPayload.customer_id,
          name: response.customer?.customer_name || orderPayload.customer_name || "Customer",
          email: response.customer?.email || `${orderPayload.customer_id.toLowerCase()}@example.in`,
          location: response.customer?.location || orderPayload.shipping_city || "Mumbai, Maharashtra",
          avatar: response.customer?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          totalOrders: response.customer?.total_orders || orderPayload.customer_total_orders || 1,
          totalReturns: response.customer?.previous_returns || orderPayload.customer_previous_returns || 0,
          cancellations: response.customer?.previous_cancellations || 0,
          returnRate: response.customer?.historical_return_rate ? (response.customer.historical_return_rate * 100) : (orderPayload.customer_return_rate ? (orderPayload.customer_return_rate * 100) : 15.0),
          avgOrderValue: response.customer?.average_order_value || orderPayload.order_value,
          memberSince: "Aug 2026",
          segment: response.customer?.customer_segment || "Standard Buyer",
          notes: response.customer?.notes || "Simulated checkout buyer."
        },
        product: response.product ? {
          id: response.product.product_id,
          name: response.product.product_name,
          sku: response.product.sku,
          category: response.product.category,
          price: response.product.price,
          image: response.product.image_url,
          categoryReturnRate: (response.product.category_return_rate || 0.15) * 100,
          productReturnRate: (response.product.historical_return_rate || 0.18) * 100,
          commonReturnReasons: response.product.common_return_reasons || ["Size/Fit mismatch"]
        } : {
          id: orderPayload.product_id || `PROD-${orderPayload.category}`,
          name: orderPayload.product_name || `${orderPayload.category} Item`,
          sku: `SKU-${orderPayload.category.slice(0, 3).toUpperCase()}-01`,
          category: orderPayload.category,
          price: orderPayload.order_value,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
          categoryReturnRate: 15.0,
          productReturnRate: 18.0,
          commonReturnReasons: ["Size/Fit mismatch"]
        },
        value: response.value || orderPayload.order_value,
        date: response.date || new Date().toISOString().split('T')[0],
        formattedDate: response.formatted_date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        paymentMethod: response.payment_method || orderPayload.payment_method,
        deliveryStatus: response.delivery_status || "Processing",
        deliveryDate: response.delivery_date || "Expected in 3 Days",
        shippingCity: response.shipping_city || orderPayload.shipping_city || "Mumbai",
        returnProbability: response.return_probability,
        riskLevel: response.risk_level,
        revenueAtRisk: response.revenue_at_risk,
        caseId: response.case_id || `RR-${response.id}`,
        status: response.status || (response.risk_level === 'HIGH' ? 'Action Required' : 'Monitored'),
        factors: (response.factors || []).map(f => ({
          name: f.name || f.feature,
          impact: f.impact || (f.weight > 0 ? `+${Math.round(f.weight * 100)}%` : `${Math.round(f.weight * 100)}%`),
          weight: f.weight,
          type: f.type || "behavior"
        })),
        evidence: response.evidence || []
      };

      // Add to store at top (deduplicating if re-simulated)
      const existingIdx = this.orders.findIndex(o => o.id === newOrder.id);
      if (existingIdx >= 0) {
        this.orders.splice(existingIdx, 1);
      }
      this.orders.unshift(newOrder);
      this.activeOrderId = newOrder.id;

      // Add to audit trail
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      this.auditTrail.unshift({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: `${dateStr}, ${timeStr}`,
        orderId: newOrder.id,
        event: "Order Simulated & Scored",
        returnProbability: `${newOrder.returnProbability}%`,
        modelVersion: this.modelStats.modelVersion,
        actor: "Order Simulator Engine",
        actionType: "SIMULATION_ORDER_CREATED",
        badgeColor: newOrder.riskLevel === 'HIGH' ? 'red' : (newOrder.riskLevel === 'MEDIUM' ? 'amber' : 'emerald'),
        details: `Simulated transaction #${newOrder.id} for ${newOrder.customer.name} (₹${newOrder.value.toLocaleString('en-IN')}). AI predicted ${newOrder.returnProbability}% return-risk [${newOrder.riskLevel}].`
      });

      this.notify();
      return newOrder;
    } catch (error) {
      console.error("[Store] Order simulation error:", error);
      throw error;
    }
  }

  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.notify();

    // Sync with backend API
    ReturnRiskAPI.updateSettings({
      high_risk_threshold: newSettings.highRiskThreshold,
      medium_risk_threshold: newSettings.mediumRiskThreshold,
      low_risk_threshold: newSettings.lowRiskThreshold,
      auto_flag_threshold: newSettings.autoFlagOrdersAbove,
      enable_realtime_inference: newSettings.enableRealtimeInference,
      notify_email: newSettings.notifyHighRiskEmail,
      notify_slack: newSettings.notifySlackWebhook
    }).catch(e => console.warn("[Store] Settings sync notice:", e.message));
  }

  getFilteredOrders() {
    return this.orders.filter(order => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        order.id.toLowerCase().includes(q) ||
        order.code.toLowerCase().includes(q) ||
        order.customer?.name?.toLowerCase()?.includes(q) ||
        order.customer?.id?.toLowerCase()?.includes(q) ||
        order.product?.name?.toLowerCase()?.includes(q) ||
        order.product?.category?.toLowerCase()?.includes(q) ||
        order.category?.toLowerCase()?.includes(q);

      const matchesRisk = this.filterRisk === 'ALL' || order.riskLevel === this.filterRisk;
      const matchesCategory = this.filterCategory === 'ALL' || (order.product?.category === this.filterCategory || order.category === this.filterCategory);

      return matchesSearch && matchesRisk && matchesCategory;
    });
  }
}

export const store = new AppStateStore();
