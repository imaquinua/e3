import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Track event
router.post('/track', authenticate, async (req, res, next) => {
  try {
    const { eventType, eventData } = req.body;
    const id = uuidv4();
    const now = Date.now();

    await db.execute({
      sql: `
        INSERT INTO analytics_events (id, user_id, event_type, event_data, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [id, req.user.userId, eventType, JSON.stringify(eventData || {}), now]
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get user analytics
router.get('/user', authenticate, async (req, res, next) => {
  try {
    const totalProjectsResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM projects WHERE user_id = ?',
      args: [req.user.userId]
    });

    const totalEcosystemsResult = await db.execute({
      sql: `
        SELECT COUNT(*) as count FROM ecosystems e
        JOIN projects p ON e.project_id = p.id
        WHERE p.user_id = ?
      `,
      args: [req.user.userId]
    });

    const totalBudgetResult = await db.execute({
      sql: `
        SELECT SUM(e.budget) as total FROM ecosystems e
        JOIN projects p ON e.project_id = p.id
        WHERE p.user_id = ?
      `,
      args: [req.user.userId]
    });

    const recentActivityResult = await db.execute({
      sql: `
        SELECT event_type, event_data, created_at
        FROM analytics_events
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `,
      args: [req.user.userId]
    });

    const stats = {
      totalProjects: totalProjectsResult.rows[0].count,
      totalEcosystems: totalEcosystemsResult.rows[0].count,
      totalBudget: totalBudgetResult.rows[0].total || 0,
      recentActivity: recentActivityResult.rows,
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
