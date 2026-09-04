import { store } from './state/store.js';
import { router, navigate } from './router.js';
import { initAIAssistant } from './components/assistant.js';

// Views
import { renderLoginView } from './views/loginView.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderOrdersView } from './views/ordersView.js';
import { renderOrderDetailsView } from './views/orderDetailsView.js';
import { renderInvestigationView } from './views/investigationView.js';
import { renderAuditTrailView } from './views/auditTrailView.js';
import { renderModelStatsView } from './views/modelStatsView.js';
import { renderAnalyticsView } from './views/analyticsView.js';
import { renderSettingsView } from './views/settingsView.js';
import { renderSimulatorView } from './views/simulatorView.js';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Register Views
  router.register('/', renderLoginView);
  router.register('/login', renderLoginView);
  router.register('/dashboard', renderDashboardView);
  router.register('/orders', renderOrdersView);
  router.register('/order-details', renderOrderDetailsView);
  router.register('/investigation', renderInvestigationView);
  router.register('/audit-trail', renderAuditTrailView);
  router.register('/model-stats', renderModelStatsView);
  router.register('/analytics', renderAnalyticsView);
  router.register('/settings', renderSettingsView);
  router.register('/simulator', renderSimulatorView);
  router.register('/order-simulator', renderSimulatorView);

  // Bind Sidebar and Bottom Navigation clicks
  document.querySelectorAll('[data-nav-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.getAttribute('data-nav-route');
      navigate(route);
    });
  });

  document.querySelectorAll('[data-bottom-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.getAttribute('data-bottom-route');
      navigate(route);
    });
  });

  // Logout Trigger
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      store.logout();
      navigate('/login');
    });
  }

  // Header Logo click -> Dashboard
  const logoBtn = document.getElementById('header-logo-btn');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => navigate('/dashboard'));
  }

  // Notifications popup mock
  const btnNotif = document.getElementById('btn-notifications');
  if (btnNotif) {
    btnNotif.addEventListener('click', () => {
      alert("Notifications:\n• 124 High Return-Risk orders pending review.\n• Model Drift PSI: 0.012 (Healthy)\n• Last batch inference completed 2 mins ago.");
    });
  }

  // Initialize Floating AI Assistant
  initAIAssistant();

  // Route first page
  router.handleRouteChange();
});
