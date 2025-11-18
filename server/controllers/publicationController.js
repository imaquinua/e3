import { randomUUID } from 'crypto';
import db from '../models/database.js';
import decisionEngine from '../services/decisionEngine.js';

/**
 * Crear nueva publicación
 */
export const createPublication = async (req, res) => {
  try {
    const {
      campaignId,
      contentPieceId,
      name,
      platform,
      format,
      buyType,
      duration,
      objective,
      budget,
      startDate,
      endDate,
      parentId
    } = req.body;

    // Verificar que la campaña existe y pertenece al usuario
    const campaignResult = await db.execute({
      sql: `SELECT c.* FROM campaigns c
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects p ON e.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?`,
      args: [campaignId, req.user.id]
    });

    if (!campaignResult.rows || campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const publication = {
      id: randomUUID(),
      campaign_id: campaignId,
      content_piece_id: contentPieceId || null,
      name,
      status: 'active',
      platform,
      format,
      buy_type: buyType || null,
      duration: duration || null,
      objective,
      budget,
      start_date: startDate ? new Date(startDate).getTime() : null,
      end_date: endDate ? new Date(endDate).getTime() : null,
      creative_version: parentId ? 2 : 1,
      parent_id: parentId || null,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    await db.execute({
      sql: `INSERT INTO publications
            (id, campaign_id, content_piece_id, name, status, platform, format, buy_type, duration, objective, budget, start_date, end_date, creative_version, parent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        publication.id,
        publication.campaign_id,
        publication.content_piece_id,
        publication.name,
        publication.status,
        publication.platform,
        publication.format,
        publication.buy_type,
        publication.duration,
        publication.objective,
        publication.budget,
        publication.start_date,
        publication.end_date,
        publication.creative_version,
        publication.parent_id,
        publication.created_at,
        publication.updated_at
      ]
    });

    res.status(201).json(publication);
  } catch (error) {
    console.error('Error creating publication:', error);
    res.status(500).json({ error: 'Error al crear publicación' });
  }
};

/**
 * Obtener publicaciones de una campaña
 */
export const getPublicationsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Verificar acceso
    const campaignResult = await db.execute({
      sql: `SELECT c.* FROM campaigns c
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects p ON e.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?`,
      args: [campaignId, req.user.id]
    });

    if (!campaignResult.rows || campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const result = await db.execute({
      sql: `SELECT p.*,
                   (SELECT COUNT(*) FROM performance_metrics WHERE publication_id = p.id) as metrics_count
            FROM publications p
            WHERE p.campaign_id = ?
            ORDER BY p.created_at DESC`,
      args: [campaignId]
    });

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
};

/**
 * Obtener publicación por ID con métricas y recomendaciones
 */
export const getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT p.* FROM publications p
            JOIN campaigns c ON p.campaign_id = c.id
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects pr ON e.project_id = pr.id
            WHERE p.id = ? AND pr.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const publication = result.rows[0];

    // Obtener métricas
    const metricsResult = await db.execute({
      sql: `SELECT * FROM performance_metrics
            WHERE publication_id = ?
            ORDER BY metric_date DESC
            LIMIT 30`,
      args: [id]
    });

    publication.metrics = metricsResult.rows || [];

    // Obtener recomendaciones activas
    publication.recommendations = await decisionEngine.getPublicationRecommendations(id, false);

    res.json(publication);
  } catch (error) {
    console.error('Error fetching publication:', error);
    res.status(500).json({ error: 'Error al obtener publicación' });
  }
};

/**
 * Actualizar publicación
 */
export const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, platform, format, buyType, duration, objective, budget, startDate, endDate } = req.body;

    // Verificar acceso
    const result = await db.execute({
      sql: `SELECT p.* FROM publications p
            JOIN campaigns c ON p.campaign_id = c.id
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects pr ON e.project_id = pr.id
            WHERE p.id = ? AND pr.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    await db.execute({
      sql: `UPDATE publications
            SET name = COALESCE(?, name),
                status = COALESCE(?, status),
                platform = COALESCE(?, platform),
                format = COALESCE(?, format),
                buy_type = COALESCE(?, buy_type),
                duration = COALESCE(?, duration),
                objective = COALESCE(?, objective),
                budget = COALESCE(?, budget),
                start_date = COALESCE(?, start_date),
                end_date = COALESCE(?, end_date),
                updated_at = ?
            WHERE id = ?`,
      args: [
        name,
        status,
        platform,
        format,
        buyType,
        duration,
        objective,
        budget,
        startDate ? new Date(startDate).getTime() : null,
        endDate ? new Date(endDate).getTime() : null,
        Date.now(),
        id
      ]
    });

    const updatedResult = await db.execute({
      sql: `SELECT * FROM publications WHERE id = ?`,
      args: [id]
    });

    res.json(updatedResult.rows[0]);
  } catch (error) {
    console.error('Error updating publication:', error);
    res.status(500).json({ error: 'Error al actualizar publicación' });
  }
};

/**
 * Eliminar publicación
 */
export const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acceso
    const result = await db.execute({
      sql: `SELECT p.* FROM publications p
            JOIN campaigns c ON p.campaign_id = c.id
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects pr ON e.project_id = pr.id
            WHERE p.id = ? AND pr.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    await db.execute({
      sql: `DELETE FROM publications WHERE id = ?`,
      args: [id]
    });

    res.json({ success: true, message: 'Publicación eliminada' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    res.status(500).json({ error: 'Error al eliminar publicación' });
  }
};

/**
 * Actualizar o agregar métricas de performance
 */
export const updatePerformanceMetrics = async (req, res) => {
  try {
    const { publicationId } = req.params;
    const { metricDate, impressions, views, clicks, conversions, spend } = req.body;

    // Verificar acceso
    const result = await db.execute({
      sql: `SELECT p.* FROM publications p
            JOIN campaigns c ON p.campaign_id = c.id
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects pr ON e.project_id = pr.id
            WHERE p.id = ? AND pr.user_id = ?`,
      args: [publicationId, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Calcular métricas derivadas
    const vtr = views && impressions ? (views / impressions) * 100 : 0;
    const ctr = clicks && impressions ? (clicks / impressions) * 100 : 0;
    const cpm = spend && impressions ? (spend / impressions) * 1000 : 0;
    const cpc = spend && clicks ? spend / clicks : 0;
    const cpa = spend && conversions ? spend / conversions : 0;
    const engagementRate = (clicks + views) && impressions ? ((clicks + views) / impressions) * 100 : 0;

    const metrics = {
      id: randomUUID(),
      publication_id: publicationId,
      metric_date: metricDate ? new Date(metricDate).getTime() : Date.now(),
      impressions: impressions || 0,
      views: views || 0,
      clicks: clicks || 0,
      conversions: conversions || 0,
      spend: spend || 0,
      vtr,
      ctr,
      cpm,
      cpc,
      cpa,
      roas: 0, // Se calcula cuando hay datos de revenue
      engagement_rate: engagementRate,
      created_at: Date.now()
    };

    await db.execute({
      sql: `INSERT INTO performance_metrics
            (id, publication_id, metric_date, impressions, views, clicks, conversions, spend, vtr, ctr, cpm, cpc, cpa, roas, engagement_rate, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        metrics.id,
        metrics.publication_id,
        metrics.metric_date,
        metrics.impressions,
        metrics.views,
        metrics.clicks,
        metrics.conversions,
        metrics.spend,
        metrics.vtr,
        metrics.ctr,
        metrics.cpm,
        metrics.cpc,
        metrics.cpa,
        metrics.roas,
        metrics.engagement_rate,
        metrics.created_at
      ]
    });

    // Evaluar reglas de decisión automáticamente
    const evaluation = await decisionEngine.evaluatePublication(publicationId);

    res.status(201).json({
      metrics,
      evaluation
    });
  } catch (error) {
    console.error('Error updating metrics:', error);
    res.status(500).json({ error: 'Error al actualizar métricas' });
  }
};

/**
 * Evaluar publicación contra reglas de decisión
 */
export const evaluatePublication = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acceso
    const result = await db.execute({
      sql: `SELECT p.* FROM publications p
            JOIN campaigns c ON p.campaign_id = c.id
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects pr ON e.project_id = pr.id
            WHERE p.id = ? AND pr.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const evaluation = await decisionEngine.evaluatePublication(id);
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating publication:', error);
    res.status(500).json({ error: 'Error al evaluar publicación' });
  }
};

/**
 * Resolver una recomendación
 */
export const resolveRecommendation = async (req, res) => {
  try {
    const { recommendationId } = req.params;

    // Verificar acceso
    const result = await db.execute({
      sql: `SELECT r.* FROM recommendations r
            JOIN publications p ON r.publication_id = p.id
            JOIN campaigns c ON p.campaign_id = c.id
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects pr ON e.project_id = pr.id
            WHERE r.id = ? AND pr.user_id = ?`,
      args: [recommendationId, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Recomendación no encontrada' });
    }

    const resolved = await decisionEngine.resolveRecommendation(recommendationId);
    res.json(resolved);
  } catch (error) {
    console.error('Error resolving recommendation:', error);
    res.status(500).json({ error: 'Error al resolver recomendación' });
  }
};

/**
 * Crear nueva versión de creativo (para action: change_creative)
 */
export const createCreativeVersion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acceso y obtener publicación original
    const result = await db.execute({
      sql: `SELECT p.* FROM publications p
            JOIN campaigns c ON p.campaign_id = c.id
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects pr ON e.project_id = pr.id
            WHERE p.id = ? AND pr.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const original = result.rows[0];

    // Determinar versión
    const versionResult = await db.execute({
      sql: `SELECT MAX(creative_version) as max_version
            FROM publications
            WHERE id = ? OR parent_id = ?`,
      args: [id, id]
    });

    const nextVersion = (versionResult.rows[0]?.max_version || 1) + 1;

    // Crear nueva versión
    const newVersion = {
      id: randomUUID(),
      campaign_id: original.campaign_id,
      content_piece_id: original.content_piece_id,
      name: `${original.name} - v${nextVersion}`,
      status: 'active',
      platform: original.platform,
      format: original.format,
      buy_type: original.buy_type,
      duration: original.duration,
      objective: original.objective,
      budget: original.budget,
      start_date: Date.now(),
      end_date: original.end_date,
      creative_version: nextVersion,
      parent_id: original.parent_id || id,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    await db.execute({
      sql: `INSERT INTO publications
            (id, campaign_id, content_piece_id, name, status, platform, format, buy_type, duration, objective, budget, start_date, end_date, creative_version, parent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        newVersion.id,
        newVersion.campaign_id,
        newVersion.content_piece_id,
        newVersion.name,
        newVersion.status,
        newVersion.platform,
        newVersion.format,
        newVersion.buy_type,
        newVersion.duration,
        newVersion.objective,
        newVersion.budget,
        newVersion.start_date,
        newVersion.end_date,
        newVersion.creative_version,
        newVersion.parent_id,
        newVersion.created_at,
        newVersion.updated_at
      ]
    });

    // Pausar la versión original
    await db.execute({
      sql: `UPDATE publications SET status = 'paused', updated_at = ? WHERE id = ?`,
      args: [Date.now(), id]
    });

    res.status(201).json(newVersion);
  } catch (error) {
    console.error('Error creating creative version:', error);
    res.status(500).json({ error: 'Error al crear nueva versión' });
  }
};
