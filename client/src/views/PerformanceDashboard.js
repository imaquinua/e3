import { PerformanceTree } from '../components/PerformanceTree.js';
import { PublicationFlow } from '../components/PublicationFlow.js';

export class PerformanceDashboard {
  constructor(params = {}) {
    this.campaignId = params.campaignId || null;
    this.campaign = null;
    this.performanceTree = null;
    this.publicationFlow = null;
    this.currentView = 'flow'; // 'flow' or 'tree'
  }

  async render() {
    if (!this.campaignId) {
      return `<div class="error-state"><h2>Campaign ID is required</h2></div>`;
    }

    try {
      // Cargar datos de la campaña
      this.campaign = await window.api.client.get(`/campaigns/${this.campaignId}`);

      // Cargar publicaciones con métricas y recomendaciones
      const publications = await Promise.all(
        this.campaign.publications.map(async (pub) => {
          try {
            return await window.api.client.get(`/publications/${pub.id}`);
          } catch (error) {
            console.error(`Error loading publication ${pub.id}:`, error);
            return pub;
          }
        })
      );

      this.campaign.publications = publications;

      // Cargar estadísticas de recomendaciones
      const stats = await window.api.client.get(`/campaigns/${this.campaignId}/recommendations/stats`);

      return `
        <div class="performance-dashboard">
          <div class="dashboard-header">
            <div>
              <h1>📊 Monitoreo de Performance</h1>
              <p class="campaign-name">${this.campaign.name}</p>
            </div>
            <div class="header-actions">
              <button class="btn-secondary" id="evaluateAllBtn">
                🔍 Evaluar Todo
              </button>
              <button class="btn-secondary" id="refreshBtn">
                🔄 Actualizar
              </button>
              <button class="btn-secondary" id="addPublicationBtn">
                ➕ Nueva Publicación
              </button>
            </div>
          </div>

          ${this.renderStats(stats)}

          <div class="dashboard-content">
            <div class="view-toggle-section">
              <div class="toggle-buttons">
                <button class="toggle-btn ${this.currentView === 'flow' ? 'active' : ''}" id="flowViewBtn">
                  📊 Vista de Flujo
                </button>
                <button class="toggle-btn ${this.currentView === 'tree' ? 'active' : ''}" id="treeViewBtn">
                  🌳 Vista de Árbol
                </button>
              </div>
            </div>

            ${this.currentView === 'flow' ? `
              <div class="flow-section" id="publication-flow"></div>
            ` : `
              <div class="tree-section card">
                <h2>Estructura de Campaña</h2>
                <div id="performance-tree"></div>
              </div>

              <div class="metrics-section">
                ${this.renderQuickMetrics()}
                ${this.renderActiveRecommendations()}
              </div>
            `}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error loading campaign:', error);
      return `
        <div class="error-state">
          <h2>Error al cargar la campaña</h2>
          <p>${error.message}</p>
          <button onclick="window.location.hash = '#/dashboard'" class="btn-primary">
            Volver al Dashboard
          </button>
        </div>
      `;
    }
  }

  renderStats(stats) {
    return `
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-label">Presupuesto Total</div>
            <div class="stat-value">$${this.campaign.total_budget.toLocaleString()}</div>
            <div class="stat-meta">Gastado: $${this.campaign.spent_budget.toLocaleString()}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📢</div>
          <div class="stat-content">
            <div class="stat-label">Publicaciones</div>
            <div class="stat-value">${this.campaign.publications.length}</div>
            <div class="stat-meta">Activas</div>
          </div>
        </div>

        <div class="stat-card ${stats.critical > 0 ? 'stat-critical' : ''}">
          <div class="stat-icon">🔴</div>
          <div class="stat-content">
            <div class="stat-label">Alertas Críticas</div>
            <div class="stat-value">${stats.critical || 0}</div>
            <div class="stat-meta">Requieren acción inmediata</div>
          </div>
        </div>

        <div class="stat-card ${stats.high > 0 ? 'stat-warning' : ''}">
          <div class="stat-icon">🟡</div>
          <div class="stat-content">
            <div class="stat-label">Alertas Alta Prioridad</div>
            <div class="stat-value">${stats.high || 0}</div>
            <div class="stat-meta">Revisar pronto</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <div class="stat-label">Total Recomendaciones</div>
            <div class="stat-value">${stats.active || 0}</div>
            <div class="stat-meta">Sin resolver</div>
          </div>
        </div>
      </div>
    `;
  }

  renderQuickMetrics() {
    const allMetrics = this.campaign.publications
      .filter(pub => pub.metrics && pub.metrics.length > 0)
      .map(pub => pub.metrics[0]);

    if (allMetrics.length === 0) {
      return `
        <div class="card">
          <h3>Métricas Promedio</h3>
          <p class="empty-state">No hay datos de métricas aún</p>
          <button class="btn-primary" onclick="window.showMetricsForm()">
            Agregar Métricas
          </button>
        </div>
      `;
    }

    const avgVTR = allMetrics.reduce((sum, m) => sum + m.vtr, 0) / allMetrics.length;
    const avgCTR = allMetrics.reduce((sum, m) => sum + m.ctr, 0) / allMetrics.length;
    const avgCPA = allMetrics.reduce((sum, m) => sum + m.cpa, 0) / allMetrics.length;
    const avgROAS = allMetrics.reduce((sum, m) => sum + m.roas, 0) / allMetrics.length;

    return `
      <div class="card quick-metrics">
        <h3>Métricas Promedio de Campaña</h3>
        <div class="metrics-grid">
          <div class="metric-item ${avgVTR < 10 ? 'metric-bad' : avgVTR > 25 ? 'metric-good' : ''}">
            <span class="metric-label">VTR</span>
            <span class="metric-value">${avgVTR.toFixed(2)}%</span>
          </div>
          <div class="metric-item ${avgCTR < 1 ? 'metric-bad' : avgCTR > 3 ? 'metric-good' : ''}">
            <span class="metric-label">CTR</span>
            <span class="metric-value">${avgCTR.toFixed(2)}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">CPA</span>
            <span class="metric-value">$${avgCPA.toFixed(2)}</span>
          </div>
          <div class="metric-item ${avgROAS < 2 ? 'metric-bad' : avgROAS > 5 ? 'metric-good' : ''}">
            <span class="metric-label">ROAS</span>
            <span class="metric-value">${avgROAS.toFixed(2)}x</span>
          </div>
        </div>
      </div>
    `;
  }

  renderActiveRecommendations() {
    const allRecs = this.campaign.publications
      .flatMap(pub => pub.recommendations || [])
      .sort((a, b) => {
        const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

    if (allRecs.length === 0) {
      return `
        <div class="card">
          <h3>🎉 ¡Todo bien!</h3>
          <p>No hay recomendaciones activas. Tus publicaciones están funcionando correctamente.</p>
        </div>
      `;
    }

    return `
      <div class="card recommendations-panel">
        <h3>Recomendaciones Activas (${allRecs.length})</h3>
        <div class="recommendations-list">
          ${allRecs.slice(0, 10).map(rec => `
            <div class="recommendation-item recommendation-${rec.severity}">
              <div class="recommendation-header">
                <span class="recommendation-severity">${this.getSeverityIcon(rec.severity)}</span>
                <span class="recommendation-title">${rec.rule_name}</span>
              </div>
              <div class="recommendation-message">${rec.message}</div>
              <div class="recommendation-action">
                <strong>Acción:</strong> ${rec.action_required}
              </div>
              <div class="recommendation-actions">
                <button class="btn-sm btn-primary" onclick="window.resolveRecommendation('${rec.id}')">
                  ✓ Marcar como resuelta
                </button>
                ${rec.action_required.includes('creativo') ?
                  `<button class="btn-sm btn-secondary" onclick="window.createNewCreative('${rec.publication_id}')">
                    ➕ Crear nueva versión
                  </button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        ${allRecs.length > 10 ? `
          <p class="text-muted">Y ${allRecs.length - 10} recomendaciones más...</p>
        ` : ''}
      </div>
    `;
  }

  getSeverityIcon(severity) {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };
    return icons[severity] || '⚪';
  }

  async mounted() {
    // Inicializar la vista según el modo actual
    if (this.currentView === 'flow') {
      this.publicationFlow = new PublicationFlow('publication-flow');
      this.publicationFlow.render(this.campaign);
    } else {
      this.performanceTree = new PerformanceTree('performance-tree');
      this.performanceTree.render(this.campaign);
    }

    this.setupEventListeners();
    this.setupGlobalFunctions();
  }

  setupEventListeners() {
    const evaluateAllBtn = document.getElementById('evaluateAllBtn');
    if (evaluateAllBtn) {
      evaluateAllBtn.addEventListener('click', () => this.evaluateCampaign());
    }

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }

    const addPublicationBtn = document.getElementById('addPublicationBtn');
    if (addPublicationBtn) {
      addPublicationBtn.addEventListener('click', () => this.showAddPublicationForm());
    }

    // View toggle buttons
    const flowViewBtn = document.getElementById('flowViewBtn');
    const treeViewBtn = document.getElementById('treeViewBtn');

    if (flowViewBtn) {
      flowViewBtn.addEventListener('click', () => this.switchView('flow'));
    }

    if (treeViewBtn) {
      treeViewBtn.addEventListener('click', () => this.switchView('tree'));
    }
  }

  setupGlobalFunctions() {
    window.viewPublicationDetails = (pubId) => this.viewPublicationDetails(pubId);
    window.evaluatePublication = (pubId) => this.evaluatePublication(pubId);
    window.resolveRecommendation = (recId) => this.resolveRecommendation(recId);
    window.createNewCreative = (pubId) => this.createNewCreative(pubId);
    window.showMetricsForm = () => this.showMetricsForm();
  }

  async evaluateCampaign() {
    try {
      window.toast.info('Evaluando campaña...');
      const result = await window.api.client.post(`/campaigns/${this.campaignId}/evaluate`);
      window.toast.success(`Evaluación completada. ${result.recommendationsCreated || 0} nuevas recomendaciones`);
      this.refresh();
    } catch (error) {
      window.toast.error('Error al evaluar campaña');
      console.error(error);
    }
  }

  async evaluatePublication(pubId) {
    try {
      window.toast.info('Evaluando publicación...');
      const result = await window.api.client.post(`/publications/${pubId}/evaluate`);
      window.toast.success(`Evaluación completada`);
      this.refresh();
    } catch (error) {
      window.toast.error('Error al evaluar publicación');
      console.error(error);
    }
  }

  async resolveRecommendation(recId) {
    try {
      await window.api.client.post(`/publications/recommendations/${recId}/resolve`);
      window.toast.success('Recomendación marcada como resuelta');
      this.refresh();
    } catch (error) {
      window.toast.error('Error al resolver recomendación');
      console.error(error);
    }
  }

  async createNewCreative(pubId) {
    try {
      window.toast.info('Creando nueva versión de creativo...');
      const newVersion = await window.api.client.post(`/publications/${pubId}/new-version`);
      window.toast.success(`Nueva versión creada: ${newVersion.name}`);
      this.refresh();
    } catch (error) {
      window.toast.error('Error al crear nueva versión');
      console.error(error);
    }
  }

  viewPublicationDetails(pubId) {
    window.location.hash = `#/publication/${pubId}`;
  }

  showAddPublicationForm() {
    window.location.hash = `#/campaign/${this.campaignId}/add-publication`;
  }

  showMetricsForm() {
    window.location.hash = `#/campaign/${this.campaignId}/add-metrics`;
  }

  switchView(view) {
    this.currentView = view;
    this.refresh();
  }

  async refresh() {
    const newHtml = await this.render();
    document.getElementById('app').innerHTML = newHtml;
    await this.mounted();
  }

  destroy() {
    if (this.performanceTree) {
      this.performanceTree.destroy();
    }

    if (this.publicationFlow) {
      this.publicationFlow.destroy();
    }

    // Limpiar funciones globales
    delete window.viewPublicationDetails;
    delete window.evaluatePublication;
    delete window.resolveRecommendation;
    delete window.createNewCreative;
    delete window.showMetricsForm;
  }
}
