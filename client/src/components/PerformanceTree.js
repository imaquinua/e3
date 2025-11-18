/**
 * PerformanceTree Component
 * Visualización de árbol interactivo que muestra la estructura de publicaciones
 * con KPIs, formatos, tipos de compra, duración y objetivos
 */

export class PerformanceTree {
  constructor(containerId) {
    this.containerId = containerId;
    this.width = 1200;
    this.height = 800;
    this.data = null;
  }

  /**
   * Renderiza el árbol de performance
   */
  render(campaignData) {
    this.data = this.transformData(campaignData);

    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container ${this.containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div class="performance-tree-container">
        <div class="tree-controls">
          <button class="btn-secondary" id="expandAll">Expandir Todo</button>
          <button class="btn-secondary" id="collapseAll">Colapsar Todo</button>
          <div class="tree-legend">
            <div class="legend-item">
              <span class="legend-color" style="background: #10b981"></span>
              <span>Excelente (>25% VTR)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #f59e0b"></span>
              <span>Atención (10-25% VTR)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #ef4444"></span>
              <span>Crítico (<10% VTR)</span>
            </div>
          </div>
        </div>
        <svg id="tree-svg" width="${this.width}" height="${this.height}"></svg>
        <div id="tooltip" class="tree-tooltip"></div>
      </div>
    `;

    this.initializeD3();
    this.setupEventListeners();
  }

  /**
   * Transforma los datos de la campaña al formato del árbol
   */
  transformData(campaignData) {
    const root = {
      name: campaignData.name,
      type: 'campaign',
      data: campaignData,
      children: []
    };

    if (campaignData.publications && campaignData.publications.length > 0) {
      campaignData.publications.forEach(pub => {
        const pubNode = {
          name: pub.name,
          type: 'publication',
          data: pub,
          children: []
        };

        // Agregar nodos de información
        pubNode.children.push({
          name: `Formato: ${pub.format}`,
          type: 'info',
          data: { label: 'Formato', value: pub.format }
        });

        pubNode.children.push({
          name: `Plataforma: ${pub.platform}`,
          type: 'info',
          data: { label: 'Plataforma', value: pub.platform }
        });

        if (pub.buy_type) {
          pubNode.children.push({
            name: `Tipo de compra: ${pub.buy_type}`,
            type: 'info',
            data: { label: 'Tipo de compra', value: pub.buy_type }
          });
        }

        if (pub.duration) {
          pubNode.children.push({
            name: `Duración: ${pub.duration}s`,
            type: 'info',
            data: { label: 'Duración', value: `${pub.duration}s` }
          });
        }

        pubNode.children.push({
          name: `Objetivo: ${pub.objective}`,
          type: 'info',
          data: { label: 'Objetivo', value: pub.objective }
        });

        // Agregar KPIs si hay métricas
        if (pub.metrics && pub.metrics.length > 0) {
          const latestMetrics = pub.metrics[0];

          const kpisNode = {
            name: 'KPIs',
            type: 'kpis',
            data: latestMetrics,
            children: [
              {
                name: `VTR: ${latestMetrics.vtr.toFixed(2)}%`,
                type: 'metric',
                data: { label: 'VTR', value: latestMetrics.vtr, unit: '%', threshold: 10 }
              },
              {
                name: `CTR: ${latestMetrics.ctr.toFixed(2)}%`,
                type: 'metric',
                data: { label: 'CTR', value: latestMetrics.ctr, unit: '%', threshold: 1 }
              },
              {
                name: `CPA: $${latestMetrics.cpa.toFixed(2)}`,
                type: 'metric',
                data: { label: 'CPA', value: latestMetrics.cpa, unit: '$' }
              },
              {
                name: `ROAS: ${latestMetrics.roas.toFixed(2)}x`,
                type: 'metric',
                data: { label: 'ROAS', value: latestMetrics.roas, unit: 'x', threshold: 2 }
              }
            ]
          };
          pubNode.children.push(kpisNode);
        }

        // Agregar recomendaciones si existen
        if (pub.recommendations && pub.recommendations.length > 0) {
          const recsNode = {
            name: `Alertas (${pub.recommendations.length})`,
            type: 'recommendations',
            data: pub.recommendations,
            children: pub.recommendations.map(rec => ({
              name: rec.action_required,
              type: 'recommendation',
              data: rec
            }))
          };
          pubNode.children.push(recsNode);
        }

        root.children.push(pubNode);
      });
    }

    return root;
  }

  /**
   * Inicializa D3.js para la visualización
   */
  initializeD3() {
    // Nota: Este código requiere D3.js. Por ahora usamos una visualización HTML alternativa
    // Para implementar D3, agregar: <script src="https://d3js.org/d3.v7.min.js"></script> en index.html

    // Renderizamos una versión HTML en su lugar
    this.renderHTMLTree();
  }

  /**
   * Renderiza una versión HTML del árbol (fallback sin D3)
   */
  renderHTMLTree() {
    const svg = document.getElementById('tree-svg');
    if (!svg) return;

    // Reemplazar SVG con HTML por ahora
    const container = svg.parentElement;
    container.innerHTML = `
      <div class="html-tree">
        ${this.renderNode(this.data, 0)}
      </div>
    `;
  }

  /**
   * Renderiza un nodo del árbol recursivamente
   */
  renderNode(node, level) {
    const indent = level * 30;
    let statusClass = '';
    let icon = '';

    // Determinar el estado visual basado en el tipo de nodo
    switch (node.type) {
      case 'campaign':
        icon = '📊';
        statusClass = 'node-campaign';
        break;
      case 'publication':
        icon = '📢';
        statusClass = 'node-publication';
        // Determinar estado basado en métricas
        if (node.data.metrics && node.data.metrics.length > 0) {
          const vtr = node.data.metrics[0].vtr;
          if (vtr < 10) {
            statusClass += ' node-critical';
            icon = '🔴';
          } else if (vtr < 25) {
            statusClass += ' node-warning';
            icon = '🟡';
          } else {
            statusClass += ' node-success';
            icon = '🟢';
          }
        }
        break;
      case 'info':
        icon = 'ℹ️';
        statusClass = 'node-info';
        break;
      case 'kpis':
        icon = '📈';
        statusClass = 'node-kpis';
        break;
      case 'metric':
        icon = '📊';
        statusClass = 'node-metric';
        // Verificar threshold
        if (node.data.threshold) {
          if (node.data.value < node.data.threshold) {
            statusClass += ' node-metric-warning';
          }
        }
        break;
      case 'recommendations':
        icon = '⚠️';
        statusClass = 'node-recommendations';
        break;
      case 'recommendation':
        icon = '💡';
        statusClass = `node-recommendation node-${node.data.severity}`;
        break;
      default:
        icon = '•';
    }

    let html = `
      <div class="tree-node ${statusClass}" style="margin-left: ${indent}px" data-type="${node.type}">
        <div class="node-content">
          <span class="node-icon">${icon}</span>
          <span class="node-name">${node.name}</span>
          ${this.renderNodeActions(node)}
        </div>
    `;

    if (node.children && node.children.length > 0) {
      html += '<div class="node-children">';
      node.children.forEach(child => {
        html += this.renderNode(child, level + 1);
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Renderiza acciones específicas del nodo
   */
  renderNodeActions(node) {
    let actions = '';

    if (node.type === 'publication') {
      actions = `
        <div class="node-actions">
          <button class="btn-icon" onclick="window.viewPublicationDetails('${node.data.id}')" title="Ver detalles">
            👁️
          </button>
          <button class="btn-icon" onclick="window.evaluatePublication('${node.data.id}')" title="Evaluar ahora">
            🔍
          </button>
        </div>
      `;
    } else if (node.type === 'recommendation') {
      actions = `
        <div class="node-actions">
          <button class="btn-icon" onclick="window.resolveRecommendation('${node.data.id}')" title="Marcar como resuelta">
            ✓
          </button>
          ${node.data.action_required.includes('creativo') ?
            `<button class="btn-icon" onclick="window.createNewCreative('${node.data.publication_id}')" title="Crear nuevo creativo">
              ➕
            </button>` : ''}
        </div>
      `;
    }

    return actions;
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Toggle de nodos
    document.querySelectorAll('.tree-node').forEach(node => {
      node.addEventListener('click', (e) => {
        if (e.target.closest('.node-actions')) return;

        const children = node.querySelector('.node-children');
        if (children) {
          children.classList.toggle('collapsed');
        }
      });
    });

    // Botones de control
    const expandAll = document.getElementById('expandAll');
    const collapseAll = document.getElementById('collapseAll');

    if (expandAll) {
      expandAll.addEventListener('click', () => {
        document.querySelectorAll('.node-children').forEach(children => {
          children.classList.remove('collapsed');
        });
      });
    }

    if (collapseAll) {
      collapseAll.addEventListener('click', () => {
        document.querySelectorAll('.node-children').forEach(children => {
          children.classList.add('collapsed');
        });
      });
    }
  }

  /**
   * Actualiza los datos del árbol
   */
  update(campaignData) {
    this.render(campaignData);
  }

  /**
   * Destruye el componente
   */
  destroy() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
  }
}
