/**
 * PublicationFlow Component
 * Visualización de flujo que organiza publicaciones por performance
 * mostrando correlación entre VTR y CPL/CPA
 */

export class PublicationFlow {
  constructor(containerId) {
    this.containerId = containerId;
    this.publications = [];
    this.sortBy = 'vtr'; // vtr, cpa, cpl, roas
    this.filterBy = 'all'; // all, excellent, warning, critical
  }

  /**
   * Renderiza el flujo completo
   */
  render(campaignData) {
    this.publications = campaignData.publications || [];

    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container ${this.containerId} not found`);
      return;
    }

    // Calcular estadísticas de correlación
    const stats = this.calculateCorrelationStats();

    container.innerHTML = `
      <div class="publication-flow">
        ${this.renderControls()}
        ${this.renderCorrelationInsights(stats)}
        ${this.renderFlowPipeline()}
        ${this.renderCorrelationCharts()}
      </div>
    `;

    this.setupEventListeners();
    this.initializeCharts();
  }

  /**
   * Renderiza controles de filtrado y ordenamiento
   */
  renderControls() {
    return `
      <div class="flow-controls card">
        <div class="control-group">
          <label>Ordenar por:</label>
          <select id="sortSelector">
            <option value="vtr">VTR (Permanencia)</option>
            <option value="cpa">CPA (más bajo primero)</option>
            <option value="cpl">CPL (más bajo primero)</option>
            <option value="roas">ROAS (más alto primero)</option>
            <option value="recent">Más reciente</option>
          </select>
        </div>

        <div class="control-group">
          <label>Filtrar por:</label>
          <select id="filterSelector">
            <option value="all">Todas las publicaciones</option>
            <option value="excellent">Excelente (VTR >25%)</option>
            <option value="warning">Atención (VTR 10-25%)</option>
            <option value="critical">Crítico (VTR <10%)</option>
            <option value="has-metrics">Con métricas</option>
            <option value="no-metrics">Sin métricas</option>
          </select>
        </div>

        <div class="control-group">
          <button class="btn-secondary" id="toggleViewBtn">
            🔄 Cambiar Vista
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza insights de correlación automáticos
   */
  renderCorrelationInsights(stats) {
    if (stats.sampleSize < 2) {
      return `
        <div class="card correlation-insights">
          <h3>📊 Análisis de Correlación</h3>
          <p class="empty-state">Necesitas al menos 2 publicaciones con métricas para ver el análisis de correlación.</p>
        </div>
      `;
    }

    const correlation = stats.vtrCpaCorrelation;
    let correlationStrength = 'débil';
    let correlationColor = '#6b7280';

    if (Math.abs(correlation) > 0.7) {
      correlationStrength = 'fuerte';
      correlationColor = correlation < 0 ? '#10b981' : '#ef4444';
    } else if (Math.abs(correlation) > 0.4) {
      correlationStrength = 'moderada';
      correlationColor = '#f59e0b';
    }

    const avgCpaImprovement = stats.highVTRAvgCPA > 0
      ? ((stats.lowVTRAvgCPA - stats.highVTRAvgCPA) / stats.lowVTRAvgCPA * 100)
      : 0;

    return `
      <div class="card correlation-insights">
        <h3>📊 Análisis de Correlación VTR vs CPA</h3>

        <div class="insight-grid">
          <div class="insight-card">
            <div class="insight-header">
              <span class="insight-icon">🎯</span>
              <span class="insight-label">Correlación Detectada</span>
            </div>
            <div class="insight-value" style="color: ${correlationColor}">
              ${correlation.toFixed(3)}
            </div>
            <div class="insight-description">
              Correlación <strong>${correlationStrength}</strong> ${correlation < 0 ? 'negativa' : 'positiva'}
              ${correlation < 0 ? ' ✅ (Mayor VTR = Menor CPA)' : ' ⚠️ (Mayor VTR = Mayor CPA)'}
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-header">
              <span class="insight-icon">🟢</span>
              <span class="insight-label">VTR Alto (>25%)</span>
            </div>
            <div class="insight-value">
              $${stats.highVTRAvgCPA.toFixed(2)}
            </div>
            <div class="insight-description">
              CPA promedio en ${stats.highVTRCount} publicaciones
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-header">
              <span class="insight-icon">🟡</span>
              <span class="insight-label">VTR Medio (10-25%)</span>
            </div>
            <div class="insight-value">
              $${stats.mediumVTRAvgCPA.toFixed(2)}
            </div>
            <div class="insight-description">
              CPA promedio en ${stats.mediumVTRCount} publicaciones
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-header">
              <span class="insight-icon">🔴</span>
              <span class="insight-label">VTR Bajo (<10%)</span>
            </div>
            <div class="insight-value">
              $${stats.lowVTRAvgCPA.toFixed(2)}
            </div>
            <div class="insight-description">
              CPA promedio en ${stats.lowVTRCount} publicaciones
            </div>
          </div>
        </div>

        ${avgCpaImprovement > 0 ? `
          <div class="insight-highlight">
            💡 <strong>Insight clave:</strong> Las publicaciones con VTR alto (>25%) tienen un CPA
            <span class="highlight-success">${avgCpaImprovement.toFixed(1)}% menor</span>
            que las de VTR bajo. Enfócate en mejorar la permanencia del video.
          </div>
        ` : ''}

        <div class="insight-recommendations">
          <h4>🎬 Recomendaciones basadas en datos:</h4>
          <ul>
            ${correlation < -0.3 ? `
              <li>✅ Existe correlación negativa fuerte: mayor permanencia = menor CPA</li>
              <li>🎥 Invierte en creativos que capturen atención en los primeros 3 segundos</li>
              <li>📊 Prioriza formatos de video que maximicen VTR</li>
            ` : ''}
            ${stats.highVTRAvgCPA < stats.lowVTRAvgCPA ? `
              <li>💰 Las publicaciones con VTR >25% son ${avgCpaImprovement.toFixed(0)}% más eficientes en costo</li>
            ` : ''}
            ${stats.lowVTRCount > stats.highVTRCount ? `
              <li>⚠️ Tienes más publicaciones de bajo VTR que alto VTR - optimiza tus creativos</li>
            ` : ''}
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza el pipeline de flujo
   */
  renderFlowPipeline() {
    const filtered = this.getFilteredPublications();
    const sorted = this.getSortedPublications(filtered);

    // Agrupar por categorías de performance
    const excellent = sorted.filter(p => this.getVTR(p) >= 25);
    const warning = sorted.filter(p => this.getVTR(p) >= 10 && this.getVTR(p) < 25);
    const critical = sorted.filter(p => this.getVTR(p) < 10 && this.getVTR(p) > 0);
    const noMetrics = sorted.filter(p => !p.metrics || p.metrics.length === 0);

    return `
      <div class="flow-pipeline">
        <h3>📊 Pipeline de Publicaciones</h3>
        <div class="pipeline-lanes">
          ${this.renderLane('excellent', 'Excelente Performance', excellent, '#10b981')}
          ${this.renderLane('warning', 'Requiere Atención', warning, '#f59e0b')}
          ${this.renderLane('critical', 'Crítico - Acción Inmediata', critical, '#ef4444')}
          ${this.renderLane('no-metrics', 'Sin Métricas', noMetrics, '#6b7280')}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza un lane del pipeline
   */
  renderLane(id, title, publications, color) {
    return `
      <div class="pipeline-lane" data-lane="${id}">
        <div class="lane-header" style="background: ${color}">
          <h4>${title}</h4>
          <span class="lane-count">${publications.length}</span>
        </div>
        <div class="lane-content">
          ${publications.length === 0 ? `
            <div class="empty-lane">
              <p>No hay publicaciones en esta categoría</p>
            </div>
          ` : publications.map(pub => this.renderPublicationCard(pub, color)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza una tarjeta de publicación
   */
  renderPublicationCard(pub, accentColor) {
    const metrics = pub.metrics && pub.metrics.length > 0 ? pub.metrics[0] : null;
    const hasRecommendations = pub.recommendations && pub.recommendations.length > 0;

    return `
      <div class="publication-card" data-id="${pub.id}" style="border-left: 4px solid ${accentColor}">
        <div class="pub-card-header">
          <h5>${pub.name}</h5>
          ${hasRecommendations ? `
            <span class="alert-badge" title="${pub.recommendations.length} recomendaciones">
              ⚠️ ${pub.recommendations.length}
            </span>
          ` : ''}
        </div>

        <div class="pub-card-meta">
          <span>📱 ${pub.platform}</span>
          <span>🎬 ${pub.format}</span>
          ${pub.duration ? `<span>⏱️ ${pub.duration}s</span>` : ''}
        </div>

        ${metrics ? `
          <div class="pub-card-metrics">
            <div class="metric-row">
              <span class="metric-label">VTR:</span>
              <span class="metric-value ${this.getMetricClass(metrics.vtr, 'vtr')}">${metrics.vtr.toFixed(2)}%</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">CPA:</span>
              <span class="metric-value">\$${metrics.cpa.toFixed(2)}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">CTR:</span>
              <span class="metric-value ${this.getMetricClass(metrics.ctr, 'ctr')}">${metrics.ctr.toFixed(2)}%</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">ROAS:</span>
              <span class="metric-value ${this.getMetricClass(metrics.roas, 'roas')}">${metrics.roas.toFixed(2)}x</span>
            </div>
          </div>

          <div class="pub-card-correlation">
            <div class="correlation-indicator">
              <span>📊 VTR/CPA Ratio:</span>
              <span class="ratio-value">${this.calculateVTRtoCPARatio(metrics)}</span>
            </div>
          </div>
        ` : `
          <div class="pub-card-empty">
            <p>Sin métricas disponibles</p>
            <button class="btn-sm btn-primary" onclick="window.addMetricsToPublication('${pub.id}')">
              Agregar Métricas
            </button>
          </div>
        `}

        <div class="pub-card-actions">
          <button class="btn-sm btn-secondary" onclick="window.viewPublicationDetails('${pub.id}')">
            👁️ Ver
          </button>
          ${metrics ? `
            <button class="btn-sm btn-secondary" onclick="window.evaluatePublication('${pub.id}')">
              🔍 Evaluar
            </button>
          ` : ''}
          ${hasRecommendations ? `
            <button class="btn-sm btn-warning" onclick="window.viewRecommendations('${pub.id}')">
              ⚠️ Alertas
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza gráficos de correlación
   */
  renderCorrelationCharts() {
    return `
      <div class="correlation-charts">
        <div class="chart-row">
          <div class="chart-container card">
            <h3>Dispersión: VTR vs CPA</h3>
            <canvas id="vtrCpaScatterChart"></canvas>
          </div>

          <div class="chart-container card">
            <h3>Dispersión: VTR vs CTR</h3>
            <canvas id="vtrCtrScatterChart"></canvas>
          </div>
        </div>

        <div class="chart-row">
          <div class="chart-container card">
            <h3>Comparación de Promedios por Nivel de VTR</h3>
            <canvas id="vtrSegmentBarChart"></canvas>
          </div>

          <div class="chart-container card">
            <h3>Tendencia Temporal</h3>
            <canvas id="timelineChart"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Inicializa los gráficos con Chart.js
   */
  async initializeCharts() {
    // Verificar si Chart.js está disponible
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js no está cargado. Agregando script...');
      await this.loadChartJS();
    }

    this.renderScatterChart('vtrCpaScatterChart', 'vtr', 'cpa', 'VTR', 'CPA');
    this.renderScatterChart('vtrCtrScatterChart', 'vtr', 'ctr', 'VTR', 'CTR');
    this.renderSegmentBarChart();
    this.renderTimelineChart();
  }

  /**
   * Carga Chart.js dinámicamente
   */
  loadChartJS() {
    return new Promise((resolve, reject) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Renderiza gráfico de dispersión
   */
  renderScatterChart(canvasId, xMetric, yMetric, xLabel, yLabel) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const data = this.publications
      .filter(p => p.metrics && p.metrics.length > 0)
      .map(p => {
        const metrics = p.metrics[0];
        return {
          x: metrics[xMetric],
          y: metrics[yMetric],
          label: p.name,
          vtr: metrics.vtr
        };
      });

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: `${xLabel} vs ${yLabel}`,
          data: data,
          backgroundColor: data.map(d => {
            if (d.vtr >= 25) return 'rgba(16, 185, 129, 0.6)';
            if (d.vtr >= 10) return 'rgba(245, 158, 11, 0.6)';
            return 'rgba(239, 68, 68, 0.6)';
          }),
          borderColor: data.map(d => {
            if (d.vtr >= 25) return 'rgb(16, 185, 129)';
            if (d.vtr >= 10) return 'rgb(245, 158, 11)';
            return 'rgb(239, 68, 68)';
          }),
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const point = context.raw;
                return [
                  point.label,
                  `${xLabel}: ${point.x.toFixed(2)}`,
                  `${yLabel}: ${point.y.toFixed(2)}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xLabel
            }
          },
          y: {
            title: {
              display: true,
              text: yLabel
            }
          }
        }
      }
    });
  }

  /**
   * Renderiza gráfico de barras por segmento
   */
  renderSegmentBarChart() {
    const canvas = document.getElementById('vtrSegmentBarChart');
    if (!canvas) return;

    const stats = this.calculateCorrelationStats();

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['VTR Alto\n(>25%)', 'VTR Medio\n(10-25%)', 'VTR Bajo\n(<10%)'],
        datasets: [
          {
            label: 'CPA Promedio',
            data: [stats.highVTRAvgCPA, stats.mediumVTRAvgCPA, stats.lowVTRAvgCPA],
            backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)'],
            borderColor: ['rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)'],
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'VTR Promedio',
            data: [stats.highVTRAvgVTR, stats.mediumVTRAvgVTR, stats.lowVTRAvgVTR],
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const index = context.dataIndex;
                const counts = [stats.highVTRCount, stats.mediumVTRCount, stats.lowVTRCount];
                return `(${counts[index]} publicaciones)`;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'CPA ($)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'VTR (%)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  /**
   * Renderiza gráfico de línea temporal
   */
  renderTimelineChart() {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;

    // Agrupar métricas por fecha
    const timelineData = [];
    this.publications.forEach(pub => {
      if (pub.metrics && pub.metrics.length > 0) {
        pub.metrics.forEach(metric => {
          timelineData.push({
            date: new Date(metric.metric_date),
            vtr: metric.vtr,
            cpa: metric.cpa,
            name: pub.name
          });
        });
      }
    });

    // Ordenar por fecha
    timelineData.sort((a, b) => a.date - b.date);

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: timelineData.map(d => d.date.toLocaleDateString()),
        datasets: [
          {
            label: 'VTR (%)',
            data: timelineData.map(d => d.vtr),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'CPA ($)',
            data: timelineData.map(d => d.cpa),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'VTR (%)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'CPA ($)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  /**
   * Calcula estadísticas de correlación
   */
  calculateCorrelationStats() {
    const withMetrics = this.publications.filter(p => p.metrics && p.metrics.length > 0);

    if (withMetrics.length === 0) {
      return {
        sampleSize: 0,
        vtrCpaCorrelation: 0,
        highVTRAvgCPA: 0,
        mediumVTRAvgCPA: 0,
        lowVTRAvgCPA: 0,
        highVTRAvgVTR: 0,
        mediumVTRAvgVTR: 0,
        lowVTRAvgVTR: 0,
        highVTRCount: 0,
        mediumVTRCount: 0,
        lowVTRCount: 0
      };
    }

    // Extraer VTR y CPA
    const vtrValues = withMetrics.map(p => p.metrics[0].vtr);
    const cpaValues = withMetrics.map(p => p.metrics[0].cpa);

    // Calcular correlación de Pearson
    const correlation = this.pearsonCorrelation(vtrValues, cpaValues);

    // Segmentar por VTR
    const highVTR = withMetrics.filter(p => p.metrics[0].vtr >= 25);
    const mediumVTR = withMetrics.filter(p => p.metrics[0].vtr >= 10 && p.metrics[0].vtr < 25);
    const lowVTR = withMetrics.filter(p => p.metrics[0].vtr < 10);

    const avg = (arr, metric) => arr.length > 0
      ? arr.reduce((sum, p) => sum + p.metrics[0][metric], 0) / arr.length
      : 0;

    return {
      sampleSize: withMetrics.length,
      vtrCpaCorrelation: correlation,
      highVTRAvgCPA: avg(highVTR, 'cpa'),
      mediumVTRAvgCPA: avg(mediumVTR, 'cpa'),
      lowVTRAvgCPA: avg(lowVTR, 'cpa'),
      highVTRAvgVTR: avg(highVTR, 'vtr'),
      mediumVTRAvgVTR: avg(mediumVTR, 'vtr'),
      lowVTRAvgVTR: avg(lowVTR, 'vtr'),
      highVTRCount: highVTR.length,
      mediumVTRCount: mediumVTR.length,
      lowVTRCount: lowVTR.length
    };
  }

  /**
   * Calcula la correlación de Pearson entre dos arrays
   */
  pearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  /**
   * Obtiene publicaciones filtradas
   */
  getFilteredPublications() {
    switch (this.filterBy) {
      case 'excellent':
        return this.publications.filter(p => this.getVTR(p) >= 25);
      case 'warning':
        return this.publications.filter(p => {
          const vtr = this.getVTR(p);
          return vtr >= 10 && vtr < 25;
        });
      case 'critical':
        return this.publications.filter(p => {
          const vtr = this.getVTR(p);
          return vtr > 0 && vtr < 10;
        });
      case 'has-metrics':
        return this.publications.filter(p => p.metrics && p.metrics.length > 0);
      case 'no-metrics':
        return this.publications.filter(p => !p.metrics || p.metrics.length === 0);
      default:
        return this.publications;
    }
  }

  /**
   * Obtiene publicaciones ordenadas
   */
  getSortedPublications(publications) {
    const sorted = [...publications];

    switch (this.sortBy) {
      case 'vtr':
        return sorted.sort((a, b) => this.getVTR(b) - this.getVTR(a));
      case 'cpa':
        return sorted.sort((a, b) => this.getCPA(a) - this.getCPA(b));
      case 'cpl':
        return sorted.sort((a, b) => this.getCPL(a) - this.getCPL(b));
      case 'roas':
        return sorted.sort((a, b) => this.getROAS(b) - this.getROAS(a));
      case 'recent':
        return sorted.sort((a, b) => b.created_at - a.created_at);
      default:
        return sorted;
    }
  }

  /**
   * Helpers para obtener métricas
   */
  getVTR(pub) {
    return pub.metrics && pub.metrics.length > 0 ? pub.metrics[0].vtr : 0;
  }

  getCPA(pub) {
    return pub.metrics && pub.metrics.length > 0 ? pub.metrics[0].cpa : 999999;
  }

  getCPL(pub) {
    // Si tienes CPL en métricas, úsalo. Sino, usa CPA
    return this.getCPA(pub);
  }

  getROAS(pub) {
    return pub.metrics && pub.metrics.length > 0 ? pub.metrics[0].roas : 0;
  }

  /**
   * Calcula ratio VTR/CPA para indicador
   */
  calculateVTRtoCPARatio(metrics) {
    if (metrics.cpa === 0) return '∞';
    const ratio = metrics.vtr / metrics.cpa;
    return ratio.toFixed(2);
  }

  /**
   * Obtiene clase CSS según métrica
   */
  getMetricClass(value, metric) {
    switch (metric) {
      case 'vtr':
        if (value >= 25) return 'metric-good';
        if (value >= 10) return 'metric-warning';
        return 'metric-bad';
      case 'ctr':
        if (value >= 3) return 'metric-good';
        if (value >= 1) return 'metric-warning';
        return 'metric-bad';
      case 'roas':
        if (value >= 5) return 'metric-good';
        if (value >= 2) return 'metric-warning';
        return 'metric-bad';
      default:
        return '';
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    const sortSelector = document.getElementById('sortSelector');
    const filterSelector = document.getElementById('filterSelector');
    const toggleViewBtn = document.getElementById('toggleViewBtn');

    if (sortSelector) {
      sortSelector.value = this.sortBy;
      sortSelector.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.refresh();
      });
    }

    if (filterSelector) {
      filterSelector.value = this.filterBy;
      filterSelector.addEventListener('change', (e) => {
        this.filterBy = e.target.value;
        this.refresh();
      });
    }

    if (toggleViewBtn) {
      toggleViewBtn.addEventListener('click', () => {
        // Toggle entre vista de flujo y vista de tabla
        this.toggleView();
      });
    }

    // Setup global functions
    window.addMetricsToPublication = (pubId) => {
      window.location.hash = `#/publication/${pubId}/add-metrics`;
    };

    window.viewRecommendations = (pubId) => {
      window.location.hash = `#/publication/${pubId}/recommendations`;
    };
  }

  /**
   * Alterna entre vistas
   */
  toggleView() {
    // Implementar toggle entre vista de flujo y otra vista (tabla, lista, etc)
    console.log('Toggle view - to be implemented');
  }

  /**
   * Actualiza el componente
   */
  refresh() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Re-render solo el pipeline para mejor performance
    const pipeline = container.querySelector('.flow-pipeline');
    if (pipeline) {
      pipeline.innerHTML = this.renderFlowPipeline();
    }
  }

  /**
   * Destruye el componente
   */
  destroy() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }

    // Limpiar funciones globales
    delete window.addMetricsToPublication;
    delete window.viewRecommendations;
  }
}
