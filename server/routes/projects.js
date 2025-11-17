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
router.get('/', async (req, res, next) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT p.*, COUNT(e.id) as ecosystem_count
        FROM projects p
        LEFT JOIN ecosystems e ON p.id = e.project_id
        WHERE p.user_id = ?
        GROUP BY p.id
        ORDER BY p.updated_at DESC
      `,
      args: [req.user.userId]
    });
    const projects = result.rows;

    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

// Get single project
router.get('/:id', async (req, res, next) => {
  try {
    const projectResult = await db.execute({
      sql: `
        SELECT * FROM projects
        WHERE id = ? AND user_id = ?
      `,
      args: [req.params.id, req.user.userId]
    });
    const project = projectResult.rows[0];

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Get ecosystems for this project
    const ecosystemsResult = await db.execute({
      sql: `SELECT * FROM ecosystems WHERE project_id = ?`,
      args: [project.id]
    });
    const ecosystems = ecosystemsResult.rows;

    res.json({ project: { ...project, ecosystems } });
  } catch (error) {
    next(error);
  }
});

// Create project
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    const id = uuidv4();
    const now = Date.now();

    await db.execute({
      sql: `
        INSERT INTO projects (id, user_id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'draft', ?, ?)
      `,
      args: [id, req.user.userId, name, description || null, now, now]
    });

    const projectResult = await db.execute({
      sql: 'SELECT * FROM projects WHERE id = ?',
      args: [id]
    });
    const project = projectResult.rows[0];

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
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if project exists and belongs to user
    const existingResult = await db.execute({
      sql: `SELECT id FROM projects WHERE id = ? AND user_id = ?`,
      args: [req.params.id, req.user.userId]
    });
    const existing = existingResult.rows[0];

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

    await db.execute({
      sql: `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
      args: values
    });

    const projectResult = await db.execute({
      sql: 'SELECT * FROM projects WHERE id = ?',
      args: [req.params.id]
    });
    const project = projectResult.rows[0];

    res.json({ project });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.execute({
      sql: `DELETE FROM projects WHERE id = ? AND user_id = ?`,
      args: [req.params.id, req.user.userId]
    });

    if (result.rowsAffected === 0) {
      throw new AppError('Project not found', 404);
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
