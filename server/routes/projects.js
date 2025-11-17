import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import db from '../models/database.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all projects for current user
router.get('/', (req, res, next) => {
  try {
    const projects = db.prepare(`
      SELECT p.*, COUNT(e.id) as ecosystem_count
      FROM projects p
      LEFT JOIN ecosystems e ON p.id = e.project_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `).all(req.user.userId);

    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

// Get single project
router.get('/:id', (req, res, next) => {
  try {
    const project = db.prepare(`
      SELECT * FROM projects
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.userId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Get ecosystems for this project
    const ecosystems = db.prepare(`
      SELECT * FROM ecosystems WHERE project_id = ?
    `).all(project.id);

    res.json({ project: { ...project, ecosystems } });
  } catch (error) {
    next(error);
  }
});

// Create project
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim(),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    const id = uuidv4();
    const now = Date.now();

    db.prepare(`
      INSERT INTO projects (id, user_id, name, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'draft', ?, ?)
    `).run(id, req.user.userId, name, description || null, now, now);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim(),
  body('status').optional().isIn(['draft', 'active', 'archived']),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if project exists and belongs to user
    const existing = db.prepare(`
      SELECT id FROM projects WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.userId);

    if (!existing) {
      throw new AppError('Project not found', 404);
    }

    const { name, description, status } = req.body;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(req.params.id);

    db.prepare(`
      UPDATE projects SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);

    res.json({ project });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', (req, res, next) => {
  try {
    const result = db.prepare(`
      DELETE FROM projects WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.userId);

    if (result.changes === 0) {
      throw new AppError('Project not found', 404);
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
