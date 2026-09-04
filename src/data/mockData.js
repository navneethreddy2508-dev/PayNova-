/**
 * AI Return-Risk Scorer — Mock Data Store
 * All monetary values are strictly in INR (₹)
 * 100% focused on E-Commerce Order Return/Refund Risk
 */

export const INITIAL_ORDERS = [
  {
    id: "8921",
    code: "#ORD-8921",
    customer: {
      id: "CUST-8492-AX",
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.in",
      location: "Bengaluru, Karnataka",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      totalOrders: 14,
      totalReturns: 6,
      cancellations: 2,
      returnRate: 42.8,
      avgOrderValue: 4500,
      memberSince: "Aug 2024",
      segment: "Frequent Returner",
      notes: "Historically returns high-value electronic accessories after 5-7 days of delivery."
    },
    product: {
      id: "PROD-SONY-XM5",
      name: "Sony WH-1000XM5 Wireless Headphones",
      sku: "EL-AUDIO-992",
      category: "Electronics",
      price: 12490,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
      categoryReturnRate: 18.2,
      productReturnRate: 24.5,
      commonReturnReasons: [
        "Buyer's remorse on high value (45%)",
        "Audio signature mismatch (30%)",
        "Found cheaper alternative elsewhere (25%)"
      ]
    },
    value: 12490,
    date: "2026-08-24",
    formattedDate: "24 Aug 2026, 02:45 PM",
    paymentMethod: "Razorpay UPI (Google Pay)",
    deliveryStatus: "Delivered",
    deliveryDate: "26 Aug 2026",
    shippingCity: "Bengaluru",
    returnProbability: 88,
    riskLevel: "HIGH",
    revenueAtRisk: 10991, // value * probability
    caseId: "RR-1021",
    status: "Flagged",
    factors: [
      { name: "Customer return rate (42.8%) exceeds category threshold (15%)", impact: "+42%", weight: 0.42, type: "customer" },
      { name: "Order value (₹12,490) is 2.8x higher than customer average (₹4,500)", impact: "+22%", weight: 0.22, type: "value" },
      { name: "High historical category return rate for premium audio (24.5%)", impact: "+16%", weight: 0.16, type: "product" },
      { name: "Repeated browsing of alternative lower-priced models post-order", impact: "+8%", weight: 0.08, type: "behavior" }
    ],
    evidence: [
      { id: "EV-1", title: "Order Receipt & UPI Transaction", type: "receipt", date: "24 Aug 2026", file: "INV-8921-RZP.pdf" },
      { id: "EV-2", title: "Courier Proof of Delivery (POD)", type: "delivery", date: "26 Aug 2026", file: "POD_BLR_8921.jpg" },
      { id: "EV-3", title: "Customer 6-Month Return History Log", type: "history", date: "26 Aug 2026", file: "CUST-8492-AX_Report.csv" }
    ]
  },
  {
    id: "8920",
    code: "#ORD-8920",
    customer: {
      id: "CUST-3910-KL",
      name: "Michael Chen",
      email: "m.chen@example.in",
      location: "Mumbai, Maharashtra",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      totalOrders: 8,
      totalReturns: 2,
      cancellations: 1,
      returnRate: 25.0,
      avgOrderValue: 7200,
      memberSince: "Jan 2025",
      segment: "Standard Buyer",
      notes: "Occasional returns for heavy furniture / ergonomic items due to sizing."
    },
    product: {
      id: "PROD-CHAIR-PRO",
      name: "ErgoFit Ergonomic Chair Pro (Mesh Edition)",
      sku: "FUR-ERG-402",
      category: "Furniture & Home",
      price: 18990,
      image: "https://images.unsplash.com/photo-1580481077195-c9f2ec43285c?w=300&auto=format&fit=crop&q=80",
      categoryReturnRate: 14.0,
      productReturnRate: 16.8,
      commonReturnReasons: ["Assembly complexity (40%)", "Size / lumbar fit (35%)", "Material dissatisfaction (25%)"]
    },
    value: 18990,
    date: "2026-08-25",
    formattedDate: "25 Aug 2026, 11:20 AM",
    paymentMethod: "Credit Card (HDFC EMI)",
    deliveryStatus: "In Transit",
    deliveryDate: "Expected 28 Aug 2026",
    shippingCity: "Mumbai",
    returnProbability: 45,
    riskLevel: "MEDIUM",
    revenueAtRisk: 8545,
    caseId: "RR-1022",
    status: "Under Review",
    factors: [
      { name: "Furniture category assembly return propensity", impact: "+20%", weight: 0.20, type: "product" },
      { name: "Customer return rate (25.0%) slightly above baseline", impact: "+15%", weight: 0.15, type: "customer" },
      { name: "High ticket order on EMI with replacement eligibility", impact: "+10%", weight: 0.10, type: "value" }
    ],
    evidence: [
      { id: "EV-4", title: "Logistics Tracking AWB", type: "delivery", date: "25 Aug 2026", file: "BLUEDART_AWB_8920.pdf" }
    ]
  },
  {
    id: "8919",
    code: "#ORD-8919",
    customer: {
      id: "CUST-7741-DL",
      name: "Ananya Sharma",
      email: "ananya.sharma@example.in",
      location: "New Delhi, Delhi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      totalOrders: 26,
      totalReturns: 14,
      cancellations: 5,
      returnRate: 53.8,
      avgOrderValue: 3200,
      memberSince: "Nov 2023",
      segment: "Bracket Purchaser",
      notes: "Known bracket buyer: frequently orders multiple sizes of identical apparel items."
    },
    product: {
      id: "PROD-DRS-FLORAL",
      name: "Handwoven Silk Tiered Midi Dress (Sizes M, L)",
      sku: "APP-DRS-109",
      category: "Apparel",
      price: 7490,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&auto=format&fit=crop&q=80",
      categoryReturnRate: 31.5,
      productReturnRate: 38.0,
      commonReturnReasons: ["Wardrobing / Bracket buying (55%)", "Size did not fit (30%)", "Color variant variance (15%)"]
    },
    value: 7490,
    date: "2026-08-25",
    formattedDate: "25 Aug 2026, 04:10 PM",
    paymentMethod: "Cash on Delivery (COD)",
    deliveryStatus: "Dispatched",
    deliveryDate: "Expected 27 Aug 2026",
    shippingCity: "New Delhi",
    returnProbability: 92,
    riskLevel: "HIGH",
    revenueAtRisk: 6890,
    caseId: "RR-1023",
    status: "Action Required",
    factors: [
      { name: "Bracket purchasing detected: 2 adjacent sizes (M, L) in same order", impact: "+48%", weight: 0.48, type: "behavior" },
      { name: "Customer return frequency (53.8%) in high-risk bracket", impact: "+26%", weight: 0.26, type: "customer" },
      { name: "Cash on Delivery payment mode with 3.2x higher return probability", impact: "+18%", weight: 0.18, type: "payment" }
    ],
    evidence: [
      { id: "EV-5", title: "COD Order Verification Call Log", type: "history", date: "25 Aug 2026", file: "IVR_CONFIRM_8919.wav" }
    ]
  },
  {
    id: "8918",
    code: "#ORD-8918",
    customer: {
      id: "CUST-1049-HY",
      name: "Rahul Varma",
      email: "rahul.v@example.in",
      location: "Hyderabad, Telangana",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      totalOrders: 32,
      totalReturns: 1,
      cancellations: 0,
      returnRate: 3.1,
      avgOrderValue: 2800,
      memberSince: "Jun 2023",
      segment: "VIP Loyal Buyer",
      notes: "Extremely low return risk. High lifetime loyalty."
    },
    product: {
      id: "PROD-TEE-COMBO",
      name: "Organic Combed Cotton Tee Pack of 3",
      sku: "APP-TEE-003",
      category: "Apparel",
      price: 1890,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80",
      categoryReturnRate: 22.0,
      productReturnRate: 6.2,
      commonReturnReasons: ["Fabric feel (50%)", "Size small (50%)"]
    },
    value: 1890,
    date: "2026-08-25",
    formattedDate: "25 Aug 2026, 06:15 PM",
    paymentMethod: "Razorpay Netbanking (SBI)",
    deliveryStatus: "Processing",
    deliveryDate: "Expected 29 Aug 2026",
    shippingCity: "Hyderabad",
    returnProbability: 12,
    riskLevel: "LOW",
    revenueAtRisk: 226,
    caseId: "RR-1024",
    status: "Monitored",
    factors: [
      { name: "Loyal customer with exceptionally low return rate (3.1%)", impact: "-35%", weight: -0.35, type: "customer" },
      { name: "Standard staple commodity with high fit certainty", impact: "-20%", weight: -0.20, type: "product" }
    ],
    evidence: []
  },
  {
    id: "8917",
    code: "#ORD-8917",
    customer: {
      id: "CUST-5582-PN",
      name: "Pooja Hegde",
      email: "pooja.h@example.in",
      location: "Pune, Maharashtra",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      totalOrders: 5,
      totalReturns: 2,
      cancellations: 0,
      returnRate: 40.0,
      avgOrderValue: 4100,
      memberSince: "Mar 2026",
      segment: "New Customer",
      notes: "Returned past footwear due to half-size mismatch."
    },
    product: {
      id: "PROD-SHOE-RUN",
      name: "NitroStride Carbon Running Shoes (UK 8)",
      sku: "FTW-RUN-880",
      category: "Footwear",
      price: 6490,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80",
      categoryReturnRate: 28.4,
      productReturnRate: 32.1,
      commonReturnReasons: ["Half size tight (60%)", "Arch support comfort (25%)", "Defective lace eyelet (15%)"]
    },
    value: 6490,
    date: "2026-08-26",
    formattedDate: "26 Aug 2026, 09:30 AM",
    paymentMethod: "Razorpay Cards (Axis Bank)",
    deliveryStatus: "Processing",
    deliveryDate: "Expected 30 Aug 2026",
    shippingCity: "Pune",
    returnProbability: 79,
    riskLevel: "HIGH",
    revenueAtRisk: 5127,
    caseId: "RR-1025",
    status: "Flagged",
    factors: [
      { name: "Footwear sizing mismatch risk (Product has 32.1% return rate for UK 8)", impact: "+38%", weight: 0.38, type: "product" },
      { name: "Customer prior footwear return history (40% return rate)", impact: "+25%", weight: 0.25, type: "customer" },
      { name: "High value for first-time brand purchase", impact: "+16%", weight: 0.16, type: "value" }
    ],
    evidence: []
  },
  {
    id: "8916",
    code: "#ORD-8916",
    customer: {
      id: "CUST-9012-CH",
      name: "Vikramaditya Rao",
      email: "vikram.rao@example.in",
      location: "Chennai, Tamil Nadu",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      totalOrders: 19,
      totalReturns: 3,
      cancellations: 1,
      returnRate: 15.7,
      avgOrderValue: 8500,
      memberSince: "Apr 2024",
      segment: "Regular Buyer",
      notes: "Steady purchaser across home appliances."
    },
    product: {
      id: "PROD-AIR-PUR",
      name: "AeroClean HEPA 13 Smart Air Purifier",
      sku: "HOM-AIR-201",
      category: "Home & Living",
      price: 11990,
      image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&auto=format&fit=crop&q=80",
      categoryReturnRate: 12.0,
      productReturnRate: 9.5,
      commonReturnReasons: ["Filter replacement cost (40%)", "Noise level (35%)"]
    },
    value: 11990,
    date: "2026-08-26",
    formattedDate: "26 Aug 2026, 11:45 AM",
    paymentMethod: "UPI (Paytm)",
    deliveryStatus: "Processing",
    deliveryDate: "Expected 31 Aug 2026",
    shippingCity: "Chennai",
    returnProbability: 28,
    riskLevel: "LOW",
    revenueAtRisk: 3357,
    caseId: "RR-1026",
    status: "Monitored",
    factors: [
      { name: "High customer reliability index (15.7% return rate)", impact: "-25%", weight: -0.25, type: "customer" },
      { name: "Standard category satisfaction rating", impact: "-10%", weight: -0.10, type: "product" }
    ],
    evidence: []
  },
  {
    id: "8915",
    code: "#ORD-8915",
    customer: {
      id: "CUST-6310-KO",
      name: "Debashis Banerjee",
      email: "debashis.b@example.in",
      location: "Kolkata, West Bengal",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      totalOrders: 11,
      totalReturns: 4,
      cancellations: 2,
      returnRate: 36.3,
      avgOrderValue: 3900,
      memberSince: "Feb 2025",
      segment: "Discretionary Buyer",
      notes: "High return rate on personal grooming electronics."
    },
    product: {
      id: "PROD-TRIM-PRO",
      name: "UltraGroom Multi-Trimmer 9-in-1 Kit",
      sku: "BEA-TRM-550",
      category: "Personal Care",
      price: 3490,
      image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=300&auto=format&fit=crop&q=80",
      categoryReturnRate: 15.0,
      productReturnRate: 21.0,
      commonReturnReasons: ["Hygiene seal opened claim (50%)", "Battery life expectation (30%)", "Attachment fit (20%)"]
    },
    value: 3490,
    date: "2026-08-26",
    formattedDate: "26 Aug 2026, 01:15 PM",
    paymentMethod: "Cash on Delivery (COD)",
    deliveryStatus: "Dispatched",
    deliveryDate: "Expected 29 Aug 2026",
    shippingCity: "Kolkata",
    returnProbability: 68,
    riskLevel: "MEDIUM",
    revenueAtRisk: 2373,
    caseId: "RR-1027",
    status: "Under Review",
    factors: [
      { name: "COD order with elevated historical return profile", impact: "+30%", weight: 0.30, type: "payment" },
      { name: "Customer return frequency (36.3%) above median", impact: "+22%", weight: 0.22, type: "customer" },
      { name: "Personal grooming product return eligibility restrictions apply", impact: "+16%", weight: 0.16, type: "product" }
    ],
    evidence: []
  }
];

export const INITIAL_CASES = {
  "RR-1021": {
    caseId: "RR-1021",
    orderId: "8921",
    status: "Open",
    priority: "High",
    assignedTo: "Navneeth (Senior Risk Analyst)",
    createdAt: "24 Aug 2026, 02:46 PM",
    updatedAt: "26 Aug 2026, 03:15 PM",
    merchantAction: "Pending Review",
    riskSummary: "High probability return prediction (88%) driven by customer return rate (42.8%) and premium audio price ticket (₹12,490).",
    notes: [
      { author: "AI System", date: "24 Aug 2026, 02:46 PM", text: "Order evaluated. Return risk score 88/100 generated." },
      { author: "Navneeth", date: "26 Aug 2026, 10:15 AM", text: "Customer contacted support regarding return policy details prior to delivery." }
    ]
  },
  "RR-1022": {
    caseId: "RR-1022",
    orderId: "8920",
    status: "Under Review",
    priority: "Medium",
    assignedTo: "Navneeth (Senior Risk Analyst)",
    createdAt: "25 Aug 2026, 11:22 AM",
    updatedAt: "25 Aug 2026, 02:40 PM",
    merchantAction: "Verification Requested",
    riskSummary: "Medium probability return (45%) on bulky ergonomic furniture item.",
    notes: [
      { author: "AI System", date: "25 Aug 2026, 11:22 AM", text: "Order evaluated. Return risk score 45/100 generated." }
    ]
  },
  "RR-1023": {
    caseId: "RR-1023",
    orderId: "8919",
    status: "Open",
    priority: "High",
    assignedTo: "Navneeth (Senior Risk Analyst)",
    createdAt: "25 Aug 2026, 04:12 PM",
    updatedAt: "26 Aug 2026, 08:30 AM",
    merchantAction: "Pending Review",
    riskSummary: "High probability return (92%) due to bracket purchasing of sizes M and L on COD.",
    notes: [
      { author: "AI System", date: "25 Aug 2026, 04:12 PM", text: "Bracket purchase rule & XGBoost confidence triggered." }
    ]
  }
};

export const INITIAL_AUDIT_TRAIL = [
  {
    id: "AUD-991",
    timestamp: "26 Aug 2026, 01:15 PM",
    orderId: "8915",
    event: "Model Prediction Generated",
    returnProbability: "68%",
    modelVersion: "ReturnGuard-XGB v2.4.1",
    actor: "AI Inference Engine",
    actionType: "MODEL_EVAL",
    badgeColor: "amber",
    details: "Predicted Medium return risk (68%) for UltraGroom 9-in-1 Kit (COD order)."
  },
  {
    id: "AUD-990",
    timestamp: "26 Aug 2026, 11:45 AM",
    orderId: "8916",
    event: "Model Prediction Generated",
    returnProbability: "28%",
    modelVersion: "ReturnGuard-XGB v2.4.1",
    actor: "AI Inference Engine",
    actionType: "MODEL_EVAL",
    badgeColor: "emerald",
    details: "Predicted Low return risk (28%) for AeroClean Purifier. Verified loyal buyer."
  },
  {
    id: "AUD-989",
    timestamp: "26 Aug 2026, 09:30 AM",
    orderId: "8917",
    event: "Flagged High Return Risk",
    returnProbability: "79%",
    modelVersion: "ReturnGuard-XGB v2.4.1",
    actor: "AI Inference Engine",
    actionType: "RISK_FLAG",
    badgeColor: "red",
    details: "High return probability on Footwear category UK 8 sizing mismatch."
  },
  {
    id: "AUD-988",
    timestamp: "25 Aug 2026, 04:12 PM",
    orderId: "8919",
    event: "Bracket Purchasing Anomaly Flagged",
    returnProbability: "92%",
    modelVersion: "ReturnGuard-XGB v2.4.1",
    actor: "AI Inference Engine",
    actionType: "RISK_FLAG",
    badgeColor: "red",
    details: "Multi-size dress order on COD flagged with 92% return likelihood."
  },
  {
    id: "AUD-987",
    timestamp: "25 Aug 2026, 02:40 PM",
    orderId: "8920",
    event: "Merchant Review: Verification Requested",
    returnProbability: "45%",
    modelVersion: "ReturnGuard-XGB v2.4.1",
    actor: "Navneeth (Merchant Reviewer)",
    actionType: "MERCHANT_ACTION",
    badgeColor: "blue",
    details: "Merchant initiated customer WhatsApp confirmation for furniture assembly requirements."
  },
  {
    id: "AUD-986",
    timestamp: "24 Aug 2026, 02:46 PM",
    orderId: "8921",
    event: "Return Risk Model Evaluated",
    returnProbability: "88%",
    modelVersion: "ReturnGuard-XGB v2.4.1",
    actor: "AI Inference Engine",
    actionType: "MODEL_EVAL",
    badgeColor: "red",
    details: "Model scored Order #8921 at 88% probability. Case #RR-1021 opened automatically."
  },
  {
    id: "AUD-985",
    timestamp: "24 Aug 2026, 02:45 PM",
    orderId: "8921",
    event: "Order Received from Razorpay Gateway",
    returnProbability: "-",
    modelVersion: "-",
    actor: "Razorpay Webhook",
    actionType: "SYSTEM_INGEST",
    badgeColor: "slate",
    details: "Order #8921 ingested with amount ₹12,490 (UPI transaction)."
  }
];

export const MODEL_STATS = {
  modelName: "ReturnGuard-Ensemble (Random Forest)",
  modelVersion: "v1.0 (Trained & Evaluated)",
  lastTrained: "Just now (Automated Pipeline)",
  trainingDatasetSize: "12,000 Orders",
  testDatasetSize: "3,000 Orders (Time-Aware Split)",
  totalFeatures: 28,
  accuracy: "81.2%",
  precision: "37.1%",
  recall: "52.8%",
  f1Score: "43.6%",
  rocAuc: "0.7541",
  falsePositiveRate: "14.3%",
  estFalsePositiveCost: 18450, // in INR
  status: "Champion Model / Validated on Chronological Split",
  confusionMatrix: {
    truePositive: 218,    // Correctly predicted return
    falsePositive: 369,   // Predicted return, but kept
    falseNegative: 195,   // Predicted kept, but returned
    trueNegative: 2218    // Correctly predicted kept
  },
  featureImportance: [
    { feature: "Customer Historical Return Rate", score: 0.1905 },
    { feature: "Product Historical Return Rate", score: 0.0997 },
    { feature: "Order Value Deviation from Mean", score: 0.0984 },
    { feature: "Order Value (Ticket Size)", score: 0.0951 },
    { feature: "Customer Avg Order Value", score: 0.0943 },
    { feature: "Bracket Buying Multi-Size Flag", score: 0.0933 },
    { feature: "Customer Previous Return Count", score: 0.0561 },
    { feature: "Promotional Discount Intensity", score: 0.0396 }
  ]
};

export const ANALYTICS_DATA = {
  kpis: {
    totalMonitoredOrders: 2450,
    totalRevenueMonitored: 4890000,
    predictedReturnsCount: 312,
    predictedReturnRate: "12.7%",
    totalRevenueAtRisk: 624500,
    actualRevenueRecovered: 188400,
    highRiskOrdersCount: 124,
    mediumRiskOrdersCount: 450,
    lowRiskOrdersCount: 1876,
    avgReturnProbability: "24.2%"
  },
  categoryBreakdown: [
    { category: "Apparel & Fashion", orderVolume: 820, returnRate: 29.4, revenueAtRisk: 284000, topReason: "Sizing & Wardrobing" },
    { category: "Footwear", orderVolume: 510, returnRate: 24.8, revenueAtRisk: 162000, topReason: "Fit / Half-size variation" },
    { category: "Consumer Electronics", orderVolume: 430, returnRate: 14.6, revenueAtRisk: 112000, topReason: "Buyer's Remorse on Premium Price" },
    { category: "Home & Furniture", orderVolume: 390, returnRate: 11.2, revenueAtRisk: 48000, topReason: "Assembly / Dimensions" },
    { category: "Beauty & Personal Care", orderVolume: 300, returnRate: 6.8, revenueAtRisk: 18500, topReason: "Damaged packaging / Seal" }
  ],
  monthlyTrend: [
    { month: "Mar", totalOrders: 1800, returnRate: 11.2, revAtRisk: 380000, recovered: 92000 },
    { month: "Apr", totalOrders: 2100, returnRate: 12.0, revAtRisk: 450000, recovered: 120000 },
    { month: "May", totalOrders: 2350, returnRate: 13.1, revAtRisk: 520000, recovered: 145000 },
    { month: "Jun", totalOrders: 2200, returnRate: 12.4, revAtRisk: 490000, recovered: 138000 },
    { month: "Jul", totalOrders: 2400, returnRate: 12.9, revAtRisk: 590000, recovered: 172000 },
    { month: "Aug", totalOrders: 2450, returnRate: 12.7, revAtRisk: 624500, recovered: 188400 }
  ]
};

export const DEFAULT_SETTINGS = {
  highRiskThreshold: 70,
  mediumRiskThreshold: 40,
  autoFlagOrdersAbove: 80,
  enableRealtimeInference: true,
  notifyHighRiskEmail: true,
  notifySlackWebhook: false,
  activeEngine: "ReturnGuard-XGB v2.4.1",
  currencySymbol: "₹",
  locale: "en-IN"
};
