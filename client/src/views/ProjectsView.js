export class ProjectsView {
  constructor() {
    this.projects = [];
  }

  async render() {
    return `
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-brand">
            <img src="/logo_letras.png" alt="E³ Content Generator" class="brand-logo-img" style="height: 40px; width: auto;">
          </div>
          <ul class="nav-menu">
            <li><a href="/dashboard" class="nav-link" data-link>Dashboard</a></li>
            <li><a href="/projects" class="nav-link active" data-link>Proyectos</a></li>
            <li><button class="btn btn-secondary" onclick="logout()">Salir</button></li>
          </ul>
        </div>
      </nav>
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h2 class="dashboard-title">Mis Proyectos</h2>
          <button class="btn btn-primary" onclick="showNewProjectModal()" data-tooltip="Crea un nuevo proyecto para organizar tus campañas" data-tooltip-position="bottom">Nuevo Proyecto</button>
        </div>
        <div class="grid grid-auto" id="projects-grid">
          <div class="loading-screen"><div class="spinner"></div></div>
        </div>
      </div>

      <div id="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center;">
        <div class="card" style="width: 90%; max-width: 500px; margin: 2rem;">
          <h3 style="margin-bottom: 1.5rem;">Nuevo Proyecto</h3>
          <form id="newProjectForm">
            <div class="form-group">
              <label class="form-label">Nombre del Proyecto</label>
              <input type="text" id="projectName" class="form-input" required placeholder="Ej: Campaña Navidad 2024" data-tooltip="Dale un nombre descriptivo a tu proyecto" data-tooltip-position="right">
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea id="projectDesc" class="form-textarea" placeholder="Describe brevemente el propósito de este proyecto..." data-tooltip="Ayuda a recordar el objetivo de este proyecto" data-tooltip-position="right"></textarea>
            </div>
            <div style="display: flex; gap: 1rem;">
              <button type="submit" class="btn btn-primary">Crear</button>
              <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async mounted() {
    window.logout = () => {
      localStorage.removeItem('e3_token');
      window.store.set('isAuthenticated', false);
      window.location.href = '/login';
    };

    window.showNewProjectModal = () => {
      document.getElementById('modal').style.display = 'flex';
    };

    window.closeModal = () => {
      document.getElementById('modal').style.display = 'none';
    };

    document.getElementById('newProjectForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createProject();
    });

    await this.loadProjects();
  }

  async loadProjects() {
    try {
      const { projects } = await window.api.projects.getAll();
      this.projects = projects;

      if (projects.length === 0) {
        document.getElementById('projects-grid').innerHTML = `
          <div class="card" style="text-align: center; padding: 3rem;">
            <p style="color: var(--color-gray-400);">No hay proyectos. Crea uno para empezar.</p>
          </div>
        `;
        return;
      }

      document.getElementById('projects-grid').innerHTML = projects.map(p => `
        <div class="card">
          <h4 style="margin-bottom: 0.5rem;">${this.escapeHtml(p.name)}</h4>
          <p style="color: var(--color-gray-400); font-size: 0.875rem; margin-bottom: 1rem;">${this.escapeHtml(p.description || '')}</p>
          <div style="margin-bottom: 1rem;">
            <span class="badge badge-primary">${p.ecosystem_count} ecosistemas</span>
          </div>
          <a href="/generator/${p.id}" class="btn btn-primary btn-full" data-link>Abrir Proyecto</a>
        </div>
      `).join('');
    } catch (error) {
      window.toast.error('Error al cargar proyectos');
    }
  }

  async createProject() {
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDesc').value;

    try {
      await window.api.projects.create({ name, description });
      window.toast.success('Proyecto creado');
      window.closeModal();
      await this.loadProjects();
    } catch (error) {
      window.toast.error('Error al crear proyecto');
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
