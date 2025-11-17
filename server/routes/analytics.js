import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Track event
router.post('/track', authenticate, (req, res, next) => {
  try {
    const { eventType, eventData } = req.body;
    const id = uuidv4();
    const now = Date.now();

    db.prepare(`
      INSERT INTO analytics_events (id, user_id, event_type, event_data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.userId, eventType, JSON.stringify(eventData || {}), now);

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get user analytics
router.get('/user', authenticate, (req, res, next) => {
  try {
    const stats = {
      totalProjects: db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ?')
        .get(req.user.userId).count,

      totalEcosystems: db.prepare(`
        SELECT COUNT(*) as count FROM ecosystems e
        JOIN projects p ON e.project_id = p.id
        WHERE p.user_id = ?
      `).get(req.user.userId).count,

      totalBudget: db.prepare(`
        SELECT SUM(e.budget) as total FROM ecosystems e
        JOIN projects p ON e.project_id = p.id
        WHERE p.user_id = ?
      `).get(req.user.userId).total || 0,

      recentActivity: db.prepare(`
        SELECT event_type, event_data, created_at
        FROM analytics_events
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `).all(req.user.userId),
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
