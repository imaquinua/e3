import { Navbar } from '../components/Navbar.js';

export class DashboardView {
  constructor() {
    this.stats = null;
    this.projects = [];
    this.navbar = new Navbar('dashboard');
  }

  async render() {
    return `
      ${this.navbar.render()}
      <div class="container">
        <div class="dashboard-header">
          <h2 class="dashboard-title">Dashboard</h2>
          <p style="color: var(--color-gray-400);">Bienvenido, ${window.store.get('user')?.name || 'Usuario'}</p>
        </div>

        <div class="stats-grid" id="stats-grid">
          <div class="stat-card">
            <div class="spinner"></div>
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 class="section-title" style="margin: 0;">Proyectos Recientes</h3>
            <a href="/projects" class="btn btn-primary" data-link data-onboarding="generator" data-tooltip="Crea y gestiona tus ecosistemas de contenido" data-tooltip-position="bottom">Ver Todos</a>
          </div>
          <div class="grid grid-auto" id="projects-grid">
            <div class="loading-screen"><div class="spinner"></div></div>
          </div>
        </div>
      </div>
    `;
  }

  async mounted() {
    this.navbar.mounted();
    await this.loadStats();
    await this.loadProjects();
  }

  async loadStats() {
    try {
      this.stats = await window.api.analytics.getUserStats();
      document.getElementById('stats-grid').innerHTML = `
        <div class="stat-card" data-tooltip="Número total de proyectos creados" data-tooltip-position="top">
          <div class="stat-value">${this.stats.totalProjects}</div>
          <div class="stat-label">Proyectos</div>
        </div>
        <div class="stat-card" data-tooltip="Ecosistemas de contenido generados con IA" data-tooltip-position="top">
          <div class="stat-value">${this.stats.totalEcosystems}</div>
          <div class="stat-label">Ecosistemas</div>
        </div>
        <div class="stat-card" data-tooltip="Suma de todos tus presupuestos de marketing" data-tooltip-position="top">
          <div class="stat-value">$${(this.stats.totalBudget || 0).toLocaleString()}</div>
          <div class="stat-label">Presupuesto Total</div>
        </div>
      `;
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async loadProjects() {
    try {
      const { projects } = await window.api.projects.getAll();
      this.projects = projects.slice(0, 6); // Show only 6 recent

      if (this.projects.length === 0) {
        document.getElementById('projects-grid').innerHTML = `
          <div class="card" style="text-align: center; padding: 3rem;">
            <p style="color: var(--color-gray-400); margin-bottom: 1rem;">No hay proyectos aún</p>
            <a href="/projects" class="btn btn-primary" data-link>Crear Primer Proyecto</a>
          </div>
        `;
        return;
      }

      document.getElementById('projects-grid').innerHTML = this.projects.map(project => `
        <div class="card" style="cursor: pointer;" onclick="window.location.href='/generator/${project.id}'">
          <h4 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${this.escapeHtml(project.name)}</h4>
          <p style="color: var(--color-gray-400); font-size: 0.875rem; margin-bottom: 1rem;">${this.escapeHtml(project.description || 'Sin descripción')}</p>
          <div style="display: flex; gap: 0.5rem;">
            <span class="badge badge-primary">${project.ecosystem_count || 0} ecosistemas</span>
            <span class="badge badge-${project.status === 'active' ? 'success' : 'primary'}">${project.status}</span>
          </div>
        </div>
      `).join('');
    } catch (error) {
      window.toast.error('Error al cargar proyectos');
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
