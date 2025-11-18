import { randomUUID } from 'crypto';
import db from '../models/database.js';
import decisionEngine from '../services/decisionEngine.js';

/**
 * Crear nueva campaña desde un ecosystem
 */
export const createCampaign = async (req, res) => {
  try {
    const { ecosystemId, name, startDate, endDate, totalBudget } = req.body;

    // Verificar que el ecosystem existe y pertenece al usuario
    const ecosystemResult = await db.execute({
      sql: `SELECT e.* FROM ecosystems e
            JOIN projects p ON e.project_id = p.id
            WHERE e.id = ? AND p.user_id = ?`,
      args: [ecosystemId, req.user.id]
    });

    if (!ecosystemResult.rows || ecosystemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ecosystem no encontrado' });
    }

    const campaign = {
      id: randomUUID(),
      ecosystem_id: ecosystemId,
      name,
      status: 'draft',
      start_date: startDate ? new Date(startDate).getTime() : null,
      end_date: endDate ? new Date(endDate).getTime() : null,
      total_budget: totalBudget,
      spent_budget: 0,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    await db.execute({
      sql: `INSERT INTO campaigns
            (id, ecosystem_id, name, status, start_date, end_date, total_budget, spent_budget, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        campaign.id,
        campaign.ecosystem_id,
        campaign.name,
        campaign.status,
        campaign.start_date,
        campaign.end_date,
        campaign.total_budget,
        campaign.spent_budget,
        campaign.created_at,
        campaign.updated_at
      ]
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Error al crear campaña' });
  }
};

/**
 * Obtener todas las campañas de un ecosystem
 */
export const getCampaignsByEcosystem = async (req, res) => {
  try {
    const { ecosystemId } = req.params;

    // Verificar acceso
    const ecosystemResult = await db.execute({
      sql: `SELECT e.* FROM ecosystems e
            JOIN projects p ON e.project_id = p.id
            WHERE e.id = ? AND p.user_id = ?`,
      args: [ecosystemId, req.user.id]
    });

    if (!ecosystemResult.rows || ecosystemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ecosystem no encontrado' });
    }

    const result = await db.execute({
      sql: `SELECT * FROM campaigns WHERE ecosystem_id = ? ORDER BY created_at DESC`,
      args: [ecosystemId]
    });

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Error al obtener campañas' });
  }
};

/**
 * Obtener campaña por ID
 */
export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT c.*, e.objective, e.product, e.market
            FROM campaigns c
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects p ON e.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    // Obtener también las publicaciones
    const pubsResult = await db.execute({
      sql: `SELECT * FROM publications WHERE campaign_id = ? ORDER BY created_at DESC`,
      args: [id]
    });

    const campaign = result.rows[0];
    campaign.publications = pubsResult.rows || [];

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Error al obtener campaña' });
  }
};

/**
 * Actualizar campaña
 */
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, startDate, endDate, totalBudget, spentBudget } = req.body;

    // Verificar acceso
    const result = await db.execute({
      sql: `SELECT c.* FROM campaigns c
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects p ON e.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    await db.execute({
      sql: `UPDATE campaigns
            SET name = COALESCE(?, name),
                status = COALESCE(?, status),
                start_date = COALESCE(?, start_date),
                end_date = COALESCE(?, end_date),
                total_budget = COALESCE(?, total_budget),
                spent_budget = COALESCE(?, spent_budget),
                updated_at = ?
            WHERE id = ?`,
      args: [
        name,
        status,
        startDate ? new Date(startDate).getTime() : null,
        endDate ? new Date(endDate).getTime() : null,
        totalBudget,
        spentBudget,
        Date.now(),
        id
      ]
    });

    const updatedResult = await db.execute({
      sql: `SELECT * FROM campaigns WHERE id = ?`,
      args: [id]
    });

    res.json(updatedResult.rows[0]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Error al actualizar campaña' });
  }
};

/**
 * Eliminar campaña
 */
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acceso
    const result = await db.execute({
      sql: `SELECT c.* FROM campaigns c
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects p ON e.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    await db.execute({
      sql: `DELETE FROM campaigns WHERE id = ?`,
      args: [id]
    });

    res.json({ success: true, message: 'Campaña eliminada' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Error al eliminar campaña' });
  }
};

/**
 * Evaluar todas las publicaciones de una campaña
 */
export const evaluateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acceso
    const result = await db.execute({
      sql: `SELECT c.* FROM campaigns c
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects p ON e.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const evaluation = await decisionEngine.evaluateCampaign(id);
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating campaign:', error);
    res.status(500).json({ error: 'Error al evaluar campaña' });
  }
};

/**
 * Obtener estadísticas de recomendaciones
 */
export const getCampaignRecommendationStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acceso
    const result = await db.execute({
      sql: `SELECT c.* FROM campaigns c
            JOIN ecosystems e ON c.ecosystem_id = e.id
            JOIN projects p ON e.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?`,
      args: [id, req.user.id]
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const stats = await decisionEngine.getRecommendationStats(id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching recommendation stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
