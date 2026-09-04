import { store } from '../state/store.js';
import { navigate } from '../router.js';

export function renderLoginView(container) {
  container.innerHTML = `
    <div class="min-h-[85vh] flex items-center justify-center p-4 sm:p-8">
      <div class="w-full max-w-[440px] flex flex-col gap-6">
        <!-- Brand Header -->
        <div class="flex flex-col items-center text-center gap-2">
          <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 border border-primary/20 shadow-sm">
            <span class="material-symbols-outlined text-primary text-[36px]">shield_lock</span>
          </div>
          <h1 class="font-headline-md text-3xl font-bold text-primary tracking-tight">PayNova</h1>
          <p class="font-body-md text-sm text-on-surface-variant font-medium">AI Order Return-Risk Scorer</p>
        </div>

        <!-- Login Card Form -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-sm">
          
          <!-- Error Notification Banner -->
          <div id="login-error-banner" class="hidden p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 transition-all">
            <span class="material-symbols-outlined text-[20px] text-red-600 shrink-0">error</span>
            <span id="login-error-text">Invalid username or password</span>
          </div>

          <form id="login-form" class="flex flex-col gap-5">
            <!-- Username -->
            <div class="flex flex-col gap-1.5">
              <label class="font-label-md text-xs font-semibold text-on-surface tracking-wider uppercase" for="login-username">Username</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">person</span>
                <input 
                  class="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-3 py-2.5 font-body-md text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                  id="login-username" 
                  name="username" 
                  placeholder="Enter username (e.g. Navneeth)" 
                  autocomplete="username"
                  required 
                  type="text"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="font-label-md text-xs font-semibold text-on-surface tracking-wider uppercase" for="login-password">Password</label>
              </div>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">key</span>
                <input 
                  class="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-3 py-2.5 font-body-md text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                  id="login-password" 
                  name="password" 
                  placeholder="••••••••" 
                  autocomplete="current-password"
                  required 
                  type="password"
                />
              </div>
            </div>

            <!-- Demo Credentials Helper Note -->
            <div class="p-3 bg-surface-container rounded-lg border border-outline-variant/60 text-xs text-on-surface-variant flex items-center justify-between">
              <span class="text-on-surface-variant font-medium">Demo Analyst:</span>
              <span class="font-mono font-bold text-primary">Navneeth / 12345678</span>
            </div>

            <!-- Submit Button -->
            <button 
              class="w-full bg-primary text-on-primary font-headline-sm font-semibold py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm flex items-center justify-center gap-2 mt-1 cursor-pointer" 
              type="submit"
            >
              <span>Sign In to PayNova</span>
              <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>
        </div>

        <!-- Security Note -->
        <div class="flex items-center justify-center gap-2 text-on-surface-variant text-xs">
          <span class="material-symbols-outlined text-emerald-600 text-[16px]">lock</span>
          <span class="font-mono-data text-xs text-on-surface-variant">Secure Institutional Session • PayNova ReturnGuard</span>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const errorBanner = container.querySelector('#login-error-banner');
  const userInput = container.querySelector('#login-username');
  const passInput = container.querySelector('#login-password');

  [userInput, passInput].forEach(inp => {
    inp.addEventListener('input', () => {
      errorBanner.classList.add('hidden');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = userInput.value.trim();
    const password = passInput.value.trim();

    if (store.login(username, password)) {
      errorBanner.classList.add('hidden');
      navigate('/dashboard');
    } else {
      errorBanner.classList.remove('hidden');
    }
  });
}
