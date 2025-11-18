import { randomUUID } from 'crypto';
import db from '../models/database.js';

class DecisionEngine {
  /**
   * Evalúa todas las reglas activas para una publicación
   */
  async evaluatePublication(publicationId) {
    try {
      // Obtener las métricas más recientes de la publicación
      const metricsResult = await db.execute({
        sql: `SELECT * FROM performance_metrics
              WHERE publication_id = ?
              ORDER BY metric_date DESC
              LIMIT 1`,
        args: [publicationId]
      });

      if (!metricsResult.rows || metricsResult.rows.length === 0) {
        return { evaluated: false, reason: 'No metrics found' };
      }

      const metrics = metricsResult.rows[0];

      // Obtener reglas activas
      const rulesResult = await db.execute({
        sql: `SELECT * FROM decision_rules
              WHERE is_active = 1
              ORDER BY priority ASC`,
        args: []
      });

      const rules = rulesResult.rows || [];
      const recommendations = [];

      // Evaluar cada regla
      for (const rule of rules) {
        const triggered = this.evaluateRule(metrics, rule);

        if (triggered) {
          const recommendation = await this.createRecommendation(
            publicationId,
            rule,
            metrics
          );
          recommendations.push(recommendation);
        }
      }

      return {
        evaluated: true,
        publicationId,
        metrics,
        recommendationsCreated: recommendations.length,
        recommendations
      };
    } catch (error) {
      console.error('Error evaluating publication:', error);
      throw error;
    }
  }

  /**
   * Evalúa si una regla se cumple
   */
  evaluateRule(metrics, rule) {
    const metricValue = metrics[rule.metric];

    if (metricValue === null || metricValue === undefined) {
      return false;
    }

    switch (rule.operator) {
      case '<':
        return metricValue < rule.threshold;
      case '<=':
        return metricValue <= rule.threshold;
      case '>':
        return metricValue > rule.threshold;
      case '>=':
        return metricValue >= rule.threshold;
      case '==':
      case '=':
        return metricValue === rule.threshold;
      case '!=':
        return metricValue !== rule.threshold;
      default:
        return false;
    }
  }

  /**
   * Crea una recomendación
   */
  async createRecommendation(publicationId, rule, metrics) {
    const severity = this.calculateSeverity(metrics, rule);
    const message = this.generateMessage(rule, metrics);

    const recommendation = {
      id: randomUUID(),
      publication_id: publicationId,
      rule_id: rule.id,
      severity,
      message,
      action_required: this.getActionDescription(rule.action),
      is_resolved: 0,
      resolved_at: null,
      created_at: Date.now()
    };

    // Verificar si ya existe una recomendación no resuelta para esta regla
    const existingResult = await db.execute({
      sql: `SELECT id FROM recommendations
            WHERE publication_id = ? AND rule_id = ? AND is_resolved = 0`,
      args: [publicationId, rule.id]
    });

    if (existingResult.rows && existingResult.rows.length > 0) {
      // Ya existe, no crear duplicada
      return null;
    }

    await db.execute({
      sql: `INSERT INTO recommendations
            (id, publication_id, rule_id, severity, message, action_required, is_resolved, resolved_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        recommendation.id,
        recommendation.publication_id,
        recommendation.rule_id,
        recommendation.severity,
        recommendation.message,
        recommendation.action_required,
        recommendation.is_resolved,
        recommendation.resolved_at,
        recommendation.created_at
      ]
    });

    return recommendation;
  }

  /**
   * Calcula la severidad basada en qué tan lejos está del threshold
   */
  calculateSeverity(metrics, rule) {
    const metricValue = metrics[rule.metric];
    const threshold = rule.threshold;
    const diff = Math.abs(metricValue - threshold);
    const percentage = (diff / threshold) * 100;

    if (rule.priority === 1) {
      if (percentage > 50) return 'critical';
      if (percentage > 25) return 'high';
      return 'medium';
    }

    if (percentage > 50) return 'high';
    if (percentage > 25) return 'medium';
    return 'low';
  }

  /**
   * Genera mensaje personalizado
   */
  generateMessage(rule, metrics) {
    const metricValue = metrics[rule.metric].toFixed(2);
    const metricName = this.getMetricDisplayName(rule.metric);

    return `${rule.name}: ${metricName} actual es ${metricValue}${this.getMetricUnit(rule.metric)}, threshold es ${rule.threshold}${this.getMetricUnit(rule.metric)}`;
  }

  /**
   * Obtiene el nombre legible de la métrica
   */
  getMetricDisplayName(metric) {
    const names = {
      vtr: 'VTR (View Through Rate)',
      ctr: 'CTR (Click Through Rate)',
      cpm: 'CPM (Cost Per Mille)',
      cpc: 'CPC (Cost Per Click)',
      cpa: 'CPA (Cost Per Acquisition)',
      roas: 'ROAS (Return on Ad Spend)',
      engagement_rate: 'Engagement Rate',
      impressions: 'Impresiones',
      views: 'Visualizaciones',
      clicks: 'Clicks',
      conversions: 'Conversiones'
    };
    return names[metric] || metric;
  }

  /**
   * Obtiene la unidad de la métrica
   */
  getMetricUnit(metric) {
    const units = {
      vtr: '%',
      ctr: '%',
      engagement_rate: '%',
      cpm: '$',
      cpc: '$',
      cpa: '$',
      roas: 'x'
    };
    return units[metric] || '';
  }

  /**
   * Obtiene descripción de la acción requerida
   */
  getActionDescription(action) {
    const descriptions = {
      change_creative: 'Cambiar el creativo de la publicación por uno nuevo que capture mejor la atención',
      optimize_targeting: 'Optimizar la segmentación de audiencia, revisar demografía, intereses y comportamientos',
      reduce_budget: 'Reducir el presupuesto diario o pausar la publicación hasta optimizarla',
      review_strategy: 'Revisar la estrategia completa: objetivo, audiencia, mensaje y canal',
      change_format: 'Cambiar el formato de la publicación (ej: de imagen a video, de carousel a stories)',
      adjust_bid: 'Ajustar la estrategia de puja (manual, automática, CPC, CPM)',
      scale_budget: 'Incrementar el presupuesto para maximizar resultados de esta publicación exitosa',
      duplicate_campaign: 'Duplicar esta campaña exitosa para expandir alcance manteniendo la fórmula ganadora',
      test_ab: 'Crear variaciones A/B test para validar mejoras',
      expand_audience: 'Expandir la audiencia a segmentos similares (lookalike)',
      pause_publication: 'Pausar temporalmente hasta implementar mejoras'
    };
    return descriptions[action] || 'Revisar y optimizar';
  }

  /**
   * Evalúa todas las publicaciones activas de una campaña
   */
  async evaluateCampaign(campaignId) {
    const publicationsResult = await db.execute({
      sql: `SELECT id FROM publications
            WHERE campaign_id = ? AND status = 'active'`,
      args: [campaignId]
    });

    const publications = publicationsResult.rows || [];
    const results = [];

    for (const pub of publications) {
      const result = await this.evaluatePublication(pub.id);
      results.push(result);
    }

    return {
      campaignId,
      evaluatedCount: results.length,
      results
    };
  }

  /**
   * Marca una recomendación como resuelta
   */
  async resolveRecommendation(recommendationId) {
    await db.execute({
      sql: `UPDATE recommendations
            SET is_resolved = 1, resolved_at = ?
            WHERE id = ?`,
      args: [Date.now(), recommendationId]
    });

    return { success: true, recommendationId };
  }

  /**
   * Obtiene todas las recomendaciones activas de una publicación
   */
  async getPublicationRecommendations(publicationId, includeResolved = false) {
    const sql = includeResolved
      ? `SELECT r.*, dr.name as rule_name, dr.description as rule_description
         FROM recommendations r
         JOIN decision_rules dr ON r.rule_id = dr.id
         WHERE r.publication_id = ?
         ORDER BY r.created_at DESC`
      : `SELECT r.*, dr.name as rule_name, dr.description as rule_description
         FROM recommendations r
         JOIN decision_rules dr ON r.rule_id = dr.id
         WHERE r.publication_id = ? AND r.is_resolved = 0
         ORDER BY
           CASE r.severity
             WHEN 'critical' THEN 1
             WHEN 'high' THEN 2
             WHEN 'medium' THEN 3
             WHEN 'low' THEN 4
           END,
           r.created_at DESC`;

    const result = await db.execute({
      sql,
      args: [publicationId]
    });

    return result.rows || [];
  }

  /**
   * Obtiene estadísticas de recomendaciones para un dashboard
   */
  async getRecommendationStats(campaignId) {
    const result = await db.execute({
      sql: `SELECT
              COUNT(*) as total,
              SUM(CASE WHEN r.is_resolved = 0 THEN 1 ELSE 0 END) as active,
              SUM(CASE WHEN r.severity = 'critical' AND r.is_resolved = 0 THEN 1 ELSE 0 END) as critical,
              SUM(CASE WHEN r.severity = 'high' AND r.is_resolved = 0 THEN 1 ELSE 0 END) as high,
              SUM(CASE WHEN r.severity = 'medium' AND r.is_resolved = 0 THEN 1 ELSE 0 END) as medium,
              SUM(CASE WHEN r.severity = 'low' AND r.is_resolved = 0 THEN 1 ELSE 0 END) as low
            FROM recommendations r
            JOIN publications p ON r.publication_id = p.id
            WHERE p.campaign_id = ?`,
      args: [campaignId]
    });

    return result.rows?.[0] || {
      total: 0,
      active: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
  }
}

export default new DecisionEngine();
