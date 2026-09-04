import { store } from './state/store.js';

class HashRouter {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.currentParams = {};
    
    window.addEventListener('hashchange', () => this.handleRouteChange());
  }

  register(path, renderFn) {
    this.routes[path] = renderFn;
  }

  navigate(url) {
    const formatted = url.startsWith('/') ? url : '/' + url;
    if (window.location.hash === '#' + formatted) {
      this.handleRouteChange();
    } else {
      window.location.hash = formatted;
    }
  }

  handleRouteChange() {
    // Determine raw route from URL hash
    let rawHash = window.location.hash ? window.location.hash.slice(1) : '';
    if (rawHash.startsWith('#')) {
      rawHash = rawHash.slice(1);
    }
    
    // Normalize path
    let [path, queryString] = (rawHash || '').split('?');
    
    // If no path is provided or root path is opened:
    if (!path || path === '/' || path === '') {
      path = store.isAuthenticated ? '/dashboard' : '/login';
      if (window.location.hash !== '#' + path) {
        window.location.hash = '#' + path;
      }
    }

    // Strict Auth Guard
    if (!store.isAuthenticated) {
      // Unauthenticated users CANNOT access any protected route
      if (path !== '/login') {
        path = '/login';
        if (window.location.hash !== '#/login') {
          window.location.hash = '#/login';
        }
      }
    } else {
      // Authenticated users accessing /login should go to /dashboard
      if (path === '/login') {
        path = '/dashboard';
        if (window.location.hash !== '#/dashboard') {
          window.location.hash = '#/dashboard';
        }
      }
    }

    const params = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }

    this.currentRoute = path;
    this.currentParams = params;

    // Update active nav indicators
    this.updateActiveNav(path);

    // Render target view
    const renderFn = this.routes[path] || (store.isAuthenticated ? this.routes['/dashboard'] : this.routes['/login']);
    const appViewport = document.getElementById('app-viewport');
    
    // Toggle Layout Elements (hide sidebar, header, bottom nav on login or unauthenticated state)
    const sidebar = document.getElementById('app-sidebar');
    const header = document.getElementById('app-header');
    const bottomNav = document.getElementById('app-bottom-nav');

    if (path === '/login' || !store.isAuthenticated) {
      if (sidebar) sidebar.classList.add('hidden');
      if (header) header.classList.add('hidden');
      if (bottomNav) bottomNav.classList.add('hidden');
    } else {
      if (sidebar) sidebar.classList.remove('hidden');
      if (header) header.classList.remove('hidden');
      if (bottomNav) bottomNav.classList.remove('hidden');
    }

    if (appViewport && renderFn) {
      renderFn(appViewport, params);
      window.scrollTo(0, 0);
    }
  }

  updateActiveNav(activePath) {
    if (!store.isAuthenticated || activePath === '/login') return;

    // Map sub-routes to parent tabs
    let activeTab = activePath;
    if (activePath.startsWith('/order-details') || activePath.startsWith('/investigation')) {
      activeTab = '/orders';
    }

    document.querySelectorAll('[data-nav-route]').forEach(link => {
      const route = link.getAttribute('data-nav-route');
      const icon = link.querySelector('.nav-icon');
      
      if (route === activeTab) {
        link.className = link.className.replace(/text-on-surface-variant|hover:bg-surface-container-low/g, '').trim();
        link.classList.add('bg-primary/10', 'text-primary', 'font-bold');
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
      } else {
        link.classList.remove('bg-primary/10', 'text-primary', 'font-bold');
        link.classList.add('text-on-surface-variant', 'hover:bg-surface-container-low', 'font-medium');
        if (icon) icon.style.fontVariationSettings = "'FILL' 0";
      }
    });

    // Mobile Bottom Nav
    document.querySelectorAll('[data-bottom-route]').forEach(link => {
      const route = link.getAttribute('data-bottom-route');
      if (route === activeTab) {
        link.className = 'flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl px-3 py-1 scale-95 transition-transform duration-150 w-16';
      } else {
        link.className = 'flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high scale-95 transition-transform duration-150 w-16 rounded-xl px-3 py-1';
      }
    });
  }
}

export const router = new HashRouter();
export const navigate = (url) => router.navigate(url);
