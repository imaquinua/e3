import { Router } from './utils/router.js';
import { Store } from './utils/store.js';
import { ThemeManager } from './utils/theme.js';
import { API } from './services/api.js';
import { Toast } from './components/Toast.js';
import { AIChat } from './components/AIChat.js';
import { Tooltip } from './components/Tooltip.js';
import { Onboarding } from './components/Onboarding.js';

// Import views
import { LoginView } from './views/LoginView.js';
import { RegisterView } from './views/RegisterView.js';
import { AuthCallbackView } from './views/AuthCallbackView.js';
import { DashboardView } from './views/DashboardView.js';
import { GeneratorView } from './views/GeneratorView.js';
import { ResultsView } from './views/ResultsView.js';
import { ProjectsView } from './views/ProjectsView.js';

// Initialize theme manager FIRST
window.themeManager = new ThemeManager();

// Initialize store
window.store = new Store();

// Initialize API
window.api = new API();

// Initialize Toast
window.toast = new Toast();

// Initialize AI Chat
window.aiChat = new AIChat();

// Initialize Tooltip system
window.tooltip = new Tooltip();

// Initialize Onboarding
window.onboarding = new Onboarding();

// Initialize Router
const router = new Router({
  '/': LoginView,
  '/login': LoginView,
  '/register': RegisterView,
  '/auth/callback': AuthCallbackView,
  '/dashboard': DashboardView,
  '/projects': ProjectsView,
  '/generator': GeneratorView,
  '/generator/:projectId': GeneratorView,
  '/results/:ecosystemId': ResultsView,
});

// Check auth status on load
async function init() {
  const token = localStorage.getItem('e3_token');

  if (token) {
    try {
      const { user } = await api.auth.me();
      store.set('user', user);
      store.set('isAuthenticated', true);
    } catch (error) {
      localStorage.removeItem('e3_token');
      store.set('isAuthenticated', false);
    }
  }

  // Hide initial loading
  const loadingScreen = document.getElementById('initial-loading');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }

  // Render AI Chat widget
  aiChat.render();

  // Initialize tooltip system
  tooltip.init();

  // Start onboarding for new users (after a small delay to let the page load)
  setTimeout(() => {
    if (store.get('isAuthenticated')) {
      onboarding.start();
    }
  }, 1000);

  // Start router
  router.start();
}

// Start app
init();

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  toast.error('Ha ocurrido un error inesperado');
});
