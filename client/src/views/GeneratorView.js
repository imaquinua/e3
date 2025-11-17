export class GeneratorView {
  constructor(params) {
    this.projectId = params.projectId;
    this.project = null;
    this.ecosystems = [];
  }

  async render() {
    return `
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-brand"><img src="/logo_letras.png" alt="E³ Content Generator" class="brand-logo-img" style="height: 40px; width: auto;"></div>
          <ul class="nav-menu">
            <li><a href="/dashboard" class="nav-link" data-link>Dashboard</a></li>
            <li><a href="/projects" class="nav-link" data-link>Proyectos</a></li>
            <li><button class="btn btn-secondary" onclick="logout()">Salir</button></li>
          </ul>
        </div>
      </nav>
      <div class="container">
        <div id="content-area">
          <div class="loading-screen"><div class="spinner"></div><p>Cargando proyecto...</p></div>
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

    if (this.projectId) {
      await this.loadProject();
    } else {
      document.getElementById('content-area').innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem;">
          <p>Selecciona un proyecto primero</p>
          <a href="/projects" class="btn btn-primary" data-link>Ver Proyectos</a>
        </div>
      `;
    }
  }

  async loadProject() {
    try {
      const data = await window.api.projects.getOne(this.projectId);
      this.project = data.project;
      this.ecosystems = data.project.ecosystems || [];

      document.getElementById('content-area').innerHTML = `
        <h2 style="margin-bottom: 1rem;">${this.escapeHtml(this.project.name)}</h2>
        <p style="color: var(--color-gray-400); margin-bottom: 2rem;">${this.escapeHtml(this.project.description || '')}</p>

        ${this.ecosystems.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem;">Ecosistemas Creados</h3>
            <div class="grid grid-auto" id="ecosystems-list">
              ${this.ecosystems.map(e => `
                <div class="card">
                  <h4>${this.escapeHtml(e.product)}</h4>
                  <p style="color: var(--color-gray-400); font-size: 0.875rem;">Objetivo: ${e.objective}</p>
                  <p style="color: var(--color-gray-400); font-size: 0.875rem;">Presupuesto: $${e.budget.toLocaleString()}</p>
                  <div style="margin-top: 1rem;">
                    <a href="/results/${e.id}" class="btn btn-primary" data-link>Ver Resultados</a>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="generator-form">
          <h3 class="section-title">Generar Nuevo Ecosistema E³</h3>
          <form id="generatorForm">
            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
              <div class="form-group">
                <label for="objective" class="form-label">Objetivo Principal</label>
                <select id="objective" class="form-select" required data-tooltip="Selecciona la meta principal de tu campaña - esto definirá tu estrategia E³" data-tooltip-position="top">
                  <option value="">Seleccionar...</option>
                  <option value="lanzamiento">Lanzamiento de Producto</option>
                  <option value="awareness">Construcción de Marca</option>
                  <option value="leads">Generación de Leads</option>
                  <option value="ventas">Ventas Directas</option>
                  <option value="retencion">Retención y LTV</option>
                  <option value="advocacy">Advocacy y Referidos</option>
                </select>
              </div>
              <div class="form-group">
                <label for="budget" class="form-label">Presupuesto Total</label>
                <input type="number" id="budget" class="form-input" min="100" placeholder="10000" required data-tooltip="Presupuesto total disponible - la IA lo distribuirá en las 4 etapas See-Think-Do-Care" data-tooltip-position="top">
              </div>
              <div class="form-group">
                <label for="product" class="form-label">Producto/Servicio</label>
                <input type="text" id="product" class="form-input" required placeholder="Ej: Curso online de Marketing Digital" data-tooltip="Describe brevemente qué vendes o promocionas" data-tooltip-position="top">
              </div>
              <div class="form-group">
                <label for="market" class="form-label">Mercado</label>
                <input type="text" id="market" class="form-input" placeholder="Ej: LATAM, España, Global" data-tooltip="Región geográfica o segmento de mercado objetivo" data-tooltip-position="top">
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
              <div class="form-group">
                <label for="audience" class="form-label">Audiencia Principal</label>
                <textarea id="audience" class="form-textarea" placeholder="Ej: Emprendedores digitales de 25-40 años interesados en marketing" data-tooltip="Define quién es tu cliente ideal - edad, intereses, comportamientos" data-tooltip-position="right"></textarea>
              </div>
              <div class="form-group">
                <label for="valueProp" class="form-label">Propuesta de Valor</label>
                <textarea id="valueProp" class="form-textarea" placeholder="Ej: Aprende marketing digital desde cero con casos prácticos reales" data-tooltip="¿Qué hace único a tu producto? ¿Por qué te elegirían a ti?" data-tooltip-position="left"></textarea>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
              <div class="form-group">
                <label for="pains" class="form-label">Customer Pains</label>
                <textarea id="pains" class="form-textarea" placeholder="Un dolor por línea" data-tooltip="¿Qué problemas, frustraciones o miedos tiene tu audiencia? (uno por línea)" data-tooltip-position="right"></textarea>
              </div>
              <div class="form-group">
                <label for="gains" class="form-label">Customer Gains</label>
                <textarea id="gains" class="form-textarea" placeholder="Un beneficio por línea" data-tooltip="¿Qué beneficios, aspiraciones o resultados buscan? (uno por línea)" data-tooltip-position="left"></textarea>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-full" id="generateBtn" data-tooltip="La IA creará tu estrategia completa See-Think-Do-Care con KPIs, presupuestos y piezas de contenido" data-tooltip-position="top">Generar Ecosistema E³</button>
          </form>
        </div>
      `;

      document.getElementById('generatorForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.generateEcosystem();
      });
    } catch (error) {
      window.toast.error('Error al cargar proyecto');
      document.getElementById('content-area').innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem;">
          <p style="color: var(--color-error);">Error al cargar proyecto</p>
          <a href="/projects" class="btn btn-primary" data-link>Volver a Proyectos</a>
        </div>
      `;
    }
  }

  async generateEcosystem() {
    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    btn.textContent = 'Generando...';

    try {
      const data = {
        projectId: this.projectId,
        objective: document.getElementById('objective').value,
        budget: parseFloat(document.getElementById('budget').value),
        product: document.getElementById('product').value,
        market: document.getElementById('market').value,
        audience: document.getElementById('audience').value,
        valueProp: document.getElementById('valueProp').value,
        pains: document.getElementById('pains').value.split('\n').filter(p => p.trim()),
        gains: document.getElementById('gains').value.split('\n').filter(g => g.trim()),
      };

      const result = await window.api.ecosystems.create(data);
      window.toast.success('Ecosistema generado correctamente');
      window.location.href = `/results/${result.ecosystem.id}`;
    } catch (error) {
      window.toast.error('Error al generar ecosistema: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'Generar Ecosistema E³';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
