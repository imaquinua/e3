export class ResultsView {
  constructor(params) {
    this.ecosystemId = params.ecosystemId;
    this.ecosystem = null;
    this.pieces = null;
    this.aiInsights = null;
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
        <div id="results-area">
          <div class="loading-screen"><div class="spinner"></div><p>Cargando resultados...</p></div>
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

    await this.loadResults();
  }

  async loadResults() {
    try {
      const data = await window.api.ecosystems.getOne(this.ecosystemId);
      this.ecosystem = data.ecosystem;
      this.pieces = data.pieces;
      this.aiInsights = data.aiInsights;

      const token = localStorage.getItem('e3_token');

      document.getElementById('results-area').innerHTML = `
        <div style="margin-bottom: 2rem;">
          <h2 style="margin-bottom: 1rem;">Ecosistema E³ Generado</h2>
          <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
            <button class="btn btn-primary" onclick="downloadJSON()">Descargar JSON</button>
            <button class="btn btn-primary" onclick="downloadPDF()">Descargar PDF</button>
            <a href="/generator/${this.ecosystem.project_id}" class="btn btn-secondary" data-link>Volver</a>
          </div>
        </div>

        <div class="card" style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.5rem;">Resumen General</h3>
          <div class="stats-grid" style="margin-bottom: 1.5rem;">
            <div class="stat-card">
              <div class="stat-value">${this.ecosystem.total_pieces}</div>
              <div class="stat-label">Piezas Totales</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${this.ecosystem.projected_roas}x</div>
              <div class="stat-label">ROAS Proyectado</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${this.ecosystem.timeframe}</div>
              <div class="stat-label">Timeframe</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">$${this.ecosystem.budget.toLocaleString()}</div>
              <div class="stat-label">Presupuesto</div>
            </div>
          </div>
          <div>
            <p><strong>Producto:</strong> ${this.escapeHtml(this.ecosystem.product)}</p>
            <p><strong>Objetivo:</strong> ${this.ecosystem.objective}</p>
            ${this.ecosystem.market ? `<p><strong>Mercado:</strong> ${this.escapeHtml(this.ecosystem.market)}</p>` : ''}
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Distribución de Presupuesto</h3>
          <div class="grid" style="grid-template-columns: repeat(4, 1fr);">
            ${['see', 'think', 'do', 'care'].map(stage => `
              <div class="card" style="text-align: center;">
                <h4 style="text-transform: uppercase; color: var(--color-primary);">${stage}</h4>
                <p style="font-size: 2rem; font-weight: 700;">${(this.ecosystem.distribution[stage] * 100).toFixed(0)}%</p>
              </div>
            `).join('')}
          </div>
        </div>

        ${this.aiInsights ? this.renderKPIGuidance() : ''}

        ${this.aiInsights ? this.renderAIInsights() : ''}

        ${['see', 'think', 'do', 'care'].map(stage => this.renderStage(stage)).join('')}
      `;

      window.downloadJSON = () => {
        window.open(`http://localhost:3000/api/export/json/${this.ecosystemId}?token=${token}`, '_blank');
      };

      window.downloadPDF = () => {
        window.open(`http://localhost:3000/api/export/pdf/${this.ecosystemId}?token=${token}`, '_blank');
      };

      // KPI Tab Switching
      window.switchKPITab = (stage) => {
        // Remove active class from all tabs and content
        document.querySelectorAll('.kpi-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.kpi-tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        event.target.classList.add('active');
        document.getElementById(`kpi-${stage}`).classList.add('active');
      };
    } catch (error) {
      window.toast.error('Error al cargar resultados');
      document.getElementById('results-area').innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem;">
          <p style="color: var(--color-error);">Error al cargar resultados</p>
          <a href="/dashboard" class="btn btn-primary" data-link>Volver al Dashboard</a>
        </div>
      `;
    }
  }

  renderKPIGuidance() {
    if (!this.aiInsights?.kpiGuidance) return '';

    const { kpisByStage, crossStageMetrics, strategicDashboard, educationalTips } = this.aiInsights.kpiGuidance;

    return `
      <div class="kpi-education-section">
        <div class="kpi-section-header">
          <h3>📊 Guía de Métricas y KPIs</h3>
          <span class="kpi-education-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Aprende a medir tu éxito
          </span>
        </div>

        <!-- Strategic Dashboard -->
        ${strategicDashboard ? `
          <div class="strategic-dashboard">
            <h4>🎯 Tu Dashboard Estratégico</h4>
            <div class="dashboard-section">
              <div class="dashboard-section-title">KPIs Principales (Revisa diario)</div>
              <div class="kpi-list">
                ${strategicDashboard.primaryKPIs?.map(kpi => `<span class="kpi-pill">${this.escapeHtml(kpi)}</span>`).join('') || ''}
              </div>
            </div>
            <div class="dashboard-section">
              <div class="dashboard-section-title">KPIs Secundarios (Revisa semanal)</div>
              <div class="kpi-list">
                ${strategicDashboard.secondaryKPIs?.map(kpi => `<span class="kpi-pill">${this.escapeHtml(kpi)}</span>`).join('') || ''}
              </div>
            </div>
            ${strategicDashboard.successCriteria ? `
              <div class="dashboard-section">
                <div class="dashboard-section-title">Criterio de Éxito</div>
                <p style="margin: 0; opacity: 0.95;">${this.escapeHtml(strategicDashboard.successCriteria)}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- KPI Tabs -->
        <div class="kpi-tabs">
          ${['see', 'think', 'do', 'care'].map(stage => `
            <button class="kpi-tab ${stage === 'see' ? 'active' : ''}" onclick="switchKPITab('${stage}')">
              ${stage.toUpperCase()}
            </button>
          `).join('')}
        </div>

        <!-- KPI Content by Stage -->
        ${['see', 'think', 'do', 'care'].map(stage => this.renderKPIStage(stage, kpisByStage[stage])).join('')}

        <!-- Cross-Stage Metrics -->
        ${crossStageMetrics && crossStageMetrics.length > 0 ? `
          <div style="margin: 2rem 0;">
            <h4 style="margin-bottom: 1rem;">📈 Métricas Transversales</h4>
            <div class="kpi-cards-grid">
              ${crossStageMetrics.map(metric => `
                <div class="kpi-card">
                  <div class="kpi-card-header">
                    <div>
                      <h5 class="kpi-name">${this.escapeHtml(metric.name)}</h5>
                    </div>
                  </div>
                  <p class="kpi-description">${this.escapeHtml(metric.description)}</p>
                  <div class="kpi-why-matters">
                    <div class="kpi-why-matters-title">💡 Por qué importa</div>
                    <p class="kpi-why-matters-content">${this.escapeHtml(metric.whyItMatters)}</p>
                  </div>
                  ${metric.benchmark ? `<p style="font-size: 0.875rem; color: var(--text-secondary);"><strong>Benchmark:</strong> ${this.escapeHtml(metric.benchmark)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Educational Tips -->
        ${educationalTips && educationalTips.length > 0 ? `
          <div class="educational-tips">
            <h4>💡 Tips Educativos</h4>
            ${educationalTips.map(tip => `
              <div class="tip-card">
                <div class="tip-title">${this.escapeHtml(tip.title)}</div>
                <div class="tip-content">${this.escapeHtml(tip.content)}</div>
                ${tip.example ? `<div class="tip-example">${this.escapeHtml(tip.example)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderKPIStage(stage, kpis) {
    if (!kpis || kpis.length === 0) {
      return `
        <div class="kpi-tab-content ${stage === 'see' ? 'active' : ''}" id="kpi-${stage}">
          <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            No hay KPIs específicos para esta etapa
          </p>
        </div>
      `;
    }

    return `
      <div class="kpi-tab-content ${stage === 'see' ? 'active' : ''}" id="kpi-${stage}">
        <div class="kpi-cards-grid">
          ${kpis.map(kpi => `
            <div class="kpi-card">
              <div class="kpi-card-header">
                <div style="flex: 1;">
                  <h5 class="kpi-name">${this.escapeHtml(kpi.name)}</h5>
                  ${kpi.howToMeasure ? `<div class="kpi-formula">${this.escapeHtml(kpi.howToMeasure)}</div>` : ''}
                </div>
              </div>

              <p class="kpi-description">${this.escapeHtml(kpi.description)}</p>

              <div class="kpi-why-matters">
                <div class="kpi-why-matters-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4M12 8h.01"></path>
                  </svg>
                  Por qué importa
                </div>
                <p class="kpi-why-matters-content">${this.escapeHtml(kpi.whyItMatters)}</p>
              </div>

              ${kpi.goodRange || kpi.warningRange || kpi.poorRange ? `
                <div class="kpi-benchmark">
                  <div class="kpi-benchmark-title">Rangos de Performance</div>
                  <div class="benchmark-bar">
                    ${kpi.poorRange ? `<div class="benchmark-segment benchmark-poor">${this.escapeHtml(kpi.poorRange)}</div>` : ''}
                    ${kpi.warningRange ? `<div class="benchmark-segment benchmark-warning">${this.escapeHtml(kpi.warningRange)}</div>` : ''}
                    ${kpi.goodRange ? `<div class="benchmark-segment benchmark-good">${this.escapeHtml(kpi.goodRange)}</div>` : ''}
                  </div>
                  <div class="benchmark-labels">
                    <span>Pobre</span>
                    <span>Aceptable</span>
                    <span>Excelente</span>
                  </div>
                </div>
              ` : ''}

              ${kpi.benchmark ? `
                <p style="font-size: 0.875rem; margin: 0.5rem 0; color: var(--text-secondary);">
                  <strong>Benchmark de industria:</strong> ${this.escapeHtml(kpi.benchmark)}
                </p>
              ` : ''}

              ${kpi.actionableInsights && kpi.actionableInsights.length > 0 ? `
                <div class="kpi-insights">
                  <div class="kpi-insights-title">🎯 Insights Accionables</div>
                  <ul class="kpi-insights-list">
                    ${kpi.actionableInsights.map(insight => `<li>${this.escapeHtml(insight)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${kpi.warningSignals && kpi.warningSignals.length > 0 ? `
                <div class="kpi-insights">
                  <div class="kpi-insights-title">⚠️ Señales de Alerta</div>
                  <ul class="kpi-insights-list">
                    ${kpi.warningSignals.map(signal => `<li class="insight-warning">${this.escapeHtml(signal)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderAIInsights() {
    const { audienceAnalysis, budgetOptimization, competitiveInsights } = this.aiInsights;

    return `
      <div style="margin-bottom: 3rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <h3 style="margin: 0;">Insights del Agente IA</h3>
          <span class="badge badge-success">Powered by Google Gemini</span>
        </div>

        <!-- Audience Analysis -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <h4 style="margin-bottom: 1rem; color: var(--primary-color);">📊 Análisis de Audiencia</h4>

          ${audienceAnalysis.audienceSegments?.length > 0 ? `
            <div style="margin-bottom: 1.5rem;">
              <h5 style="margin-bottom: 0.75rem;">Segmentos Identificados</h5>
              <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                ${audienceAnalysis.audienceSegments.map(segment => `
                  <div class="card" style="background: var(--bg-secondary); padding: 1rem;">
                    <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 0.5rem;">
                      <strong>${this.escapeHtml(segment.name)}</strong>
                      <span class="badge badge-${segment.priority === 'alta' ? 'success' : segment.priority === 'media' ? 'primary' : 'secondary'}">${segment.priority}</span>
                    </div>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0;">${this.escapeHtml(segment.description)}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${audienceAnalysis.recommendedMessaging ? `
            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
              <strong>💬 Ángulo de Comunicación Recomendado:</strong>
              <p style="margin: 0.5rem 0 0 0;">${this.escapeHtml(audienceAnalysis.recommendedMessaging.primaryAngle)}</p>
            </div>
          ` : ''}
        </div>

        <!-- Budget Optimization -->
        ${budgetOptimization ? `
          <div class="card" style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 1rem; color: var(--primary-color);">💰 Optimización de Presupuesto</h4>

            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <p style="margin: 0;"><strong>Razonamiento:</strong> ${this.escapeHtml(budgetOptimization.reasoning)}</p>
            </div>

            ${budgetOptimization.opportunities?.length > 0 ? `
              <div style="margin-bottom: 1rem;">
                <strong>✨ Oportunidades:</strong>
                <ul style="margin: 0.5rem 0 0 1.5rem; color: var(--success-color);">
                  ${budgetOptimization.opportunities.map(opp => `<li>${this.escapeHtml(opp)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${budgetOptimization.risks?.length > 0 ? `
              <div>
                <strong>⚠️ Consideraciones:</strong>
                <ul style="margin: 0.5rem 0 0 1.5rem; color: var(--text-secondary);">
                  ${budgetOptimization.risks.map(risk => `<li>${this.escapeHtml(risk)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Competitive Insights -->
        ${competitiveInsights ? `
          <div class="card">
            <h4 style="margin-bottom: 1rem; color: var(--primary-color);">🎯 Insights Competitivos</h4>

            ${competitiveInsights.marketTrends?.length > 0 ? `
              <div style="margin-bottom: 1.5rem;">
                <strong>📈 Tendencias del Mercado:</strong>
                <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 0.75rem;">
                  ${competitiveInsights.marketTrends.slice(0, 3).map(trend => `
                    <div class="card" style="background: var(--bg-secondary); padding: 1rem;">
                      <div style="display: flex; justify-content: between; margin-bottom: 0.5rem;">
                        <strong>${this.escapeHtml(trend.trend)}</strong>
                        <span class="badge badge-${trend.impact === 'alto' ? 'success' : trend.impact === 'medio' ? 'primary' : 'secondary'}">${trend.impact}</span>
                      </div>
                      <p style="font-size: 0.875rem; margin: 0.5rem 0;">${this.escapeHtml(trend.description)}</p>
                      <p style="font-size: 0.875rem; color: var(--primary-color); margin: 0;"><strong>Acción:</strong> ${this.escapeHtml(trend.actionableInsight)}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${competitiveInsights.strategicRecommendations?.length > 0 ? `
              <div>
                <strong>💡 Recomendaciones Estratégicas:</strong>
                <div style="margin-top: 0.75rem;">
                  ${competitiveInsights.strategicRecommendations.slice(0, 3).map(rec => `
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem;">
                      <div style="display: flex; justify-content: between; margin-bottom: 0.5rem;">
                        <strong>${this.escapeHtml(rec.recommendation)}</strong>
                        <span class="badge badge-${rec.priority === 'alta' ? 'success' : rec.priority === 'media' ? 'primary' : 'secondary'}">${rec.priority}</span>
                      </div>
                      <p style="font-size: 0.875rem; margin: 0; color: var(--text-secondary);">${this.escapeHtml(rec.expectedImpact)}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderStage(stage) {
    const pieces = this.pieces[stage] || [];
    if (pieces.length === 0) return '';

    return `
      <div class="stage-container">
        <div class="stage-header">
          <div>
            <h3 class="stage-name">${stage.toUpperCase()}</h3>
            <p style="color: var(--color-gray-400);">${pieces.length} piezas de contenido</p>
          </div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">
            $${pieces.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
          </div>
        </div>
        <div class="pieces-grid">
          ${pieces.map(piece => `
            <div class="piece-card">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span class="piece-type">${this.escapeHtml(piece.type)}</span>
                <span class="badge badge-primary">${piece.score}%</span>
              </div>
              <h4 class="piece-title">${this.escapeHtml(piece.title)}</h4>
              <p class="piece-description">${this.escapeHtml(piece.description)}</p>
              <div style="margin: 1rem 0;">
                <span class="badge badge-${this.getChannelColor(piece.channel)}">${this.escapeHtml(piece.channel)}</span>
                <span class="badge badge-primary">${this.escapeHtml(piece.format)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--color-gray-400);">
                <span><strong>KPI:</strong> ${this.escapeHtml(piece.kpi)}</span>
                <span><strong>$${piece.budget.toLocaleString()}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getChannelColor(channel) {
    const colors = {
      'Meta Ads': 'primary',
      'Google Display': 'success',
      'TikTok': 'primary',
      'YouTube': 'success',
    };
    return colors[channel] || 'primary';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
