import { ThemeToggle } from './ThemeToggle.js';

export class Navbar {
  constructor(activeRoute = '') {
    this.activeRoute = activeRoute;
    this.themeToggle = new ThemeToggle(window.themeManager);
  }

  render() {
    const user = window.store?.get('user');

    return `
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-brand">
            <img src="/logo_letras.png" alt="E³ Content Generator" class="brand-logo-img" style="height: 40px; width: auto;">
          </div>

          <div style="display: flex; align-items: center; gap: var(--space-md);">
            <ul class="nav-menu">
              <li><a href="/dashboard" class="nav-link ${this.activeRoute === 'dashboard' ? 'active' : ''}" data-link data-tooltip="Ve tus estadísticas y proyectos recientes" data-tooltip-position="bottom">Dashboard</a></li>
              <li><a href="/projects" class="nav-link ${this.activeRoute === 'projects' ? 'active' : ''}" data-link data-onboarding="projects" data-tooltip="Gestiona todos tus proyectos de contenido" data-tooltip-position="bottom">Proyectos</a></li>
            </ul>

            ${this.themeToggle.render()}

            <button class="btn btn-secondary" onclick="logout()" title="Cerrar sesión">
              ${user?.name || 'Salir'}
            </button>
          </div>
        </div>
      </nav>
    `;
  }

  mounted() {
    this.themeToggle.mount();

    // Make logout global
    if (!window.logout) {
      window.logout = () => {
        localStorage.removeItem('e3_token');
        window.store.set('user', null);
        window.store.set('isAuthenticated', false);
        window.location.href = '/login';
      };
    }
  }
}
