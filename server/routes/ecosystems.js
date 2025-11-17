import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import db from '../models/database.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateEcosystem } from '../utils/ecosystemGenerator.js';
import { generateEcosystemInsights } from '../services/aiAgent.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all ecosystems for a project
router.get('/project/:projectId', (req, res, next) => {
  try {
    // Verify project belongs to user
    const project = db.prepare(`
      SELECT id FROM projects WHERE id = ? AND user_id = ?
    `).get(req.params.projectId, req.user.userId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const ecosystems = db.prepare(`
      SELECT * FROM ecosystems WHERE project_id = ? ORDER BY created_at DESC
    `).all(req.params.projectId);

    res.json({ ecosystems });
  } catch (error) {
    next(error);
  }
});

// Get single ecosystem with content pieces
router.get('/:id', (req, res, next) => {
  try {
    const ecosystem = db.prepare(`
      SELECT e.*, p.user_id
      FROM ecosystems e
      JOIN projects p ON e.project_id = p.id
      WHERE e.id = ? AND p.user_id = ?
    `).get(req.params.id, req.user.userId);

    if (!ecosystem) {
      throw new AppError('Ecosystem not found', 404);
    }

    // Get content pieces
    const pieces = db.prepare(`
      SELECT * FROM content_pieces WHERE ecosystem_id = ? ORDER BY stage, score DESC
    `).all(ecosystem.id);

    // Parse JSON fields
    ecosystem.distribution = JSON.parse(ecosystem.distribution);
    ecosystem.pains = ecosystem.pains ? ecosystem.pains.split('\n') : [];
    ecosystem.gains = ecosystem.gains ? ecosystem.gains.split('\n') : [];

    // Group pieces by stage
    const piecesByStage = {
      see: pieces.filter(p => p.stage === 'see'),
      think: pieces.filter(p => p.stage === 'think'),
      do: pieces.filter(p => p.stage === 'do'),
      care: pieces.filter(p => p.stage === 'care'),
    };

    // Get AI insights if available
    let aiInsights = null;
    const insightsRow = db.prepare(`
      SELECT * FROM ai_insights WHERE ecosystem_id = ?
    `).get(ecosystem.id);

    if (insightsRow) {
      aiInsights = {
        audienceAnalysis: JSON.parse(insightsRow.audience_analysis),
        budgetOptimization: JSON.parse(insightsRow.budget_optimization),
        competitiveInsights: JSON.parse(insightsRow.competitive_insights),
        kpiGuidance: insightsRow.kpi_guidance ? JSON.parse(insightsRow.kpi_guidance) : null,
        enhancedContent: insightsRow.enhanced_content ? JSON.parse(insightsRow.enhanced_content) : null,
        generatedAt: new Date(insightsRow.created_at).toISOString(),
      };
    }

    res.json({
      ecosystem,
      pieces: piecesByStage,
      aiInsights,
    });
  } catch (error) {
    next(error);
  }
});

// Create/Generate ecosystem
router.post('/', [
  body('projectId').isUUID(),
  body('objective').isIn(['lanzamiento', 'awareness', 'leads', 'ventas', 'retencion', 'advocacy']),
  body('budget').isFloat({ min: 100 }),
  body('product').trim().isLength({ min: 1, max: 500 }),
  body('market').optional().trim(),
  body('audience').optional().trim(),
  body('valueProp').optional().trim(),
  body('pains').optional().isArray(),
  body('gains').optional().isArray(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify project belongs to user
    const project = db.prepare(`
      SELECT id FROM projects WHERE id = ? AND user_id = ?
    `).get(req.body.projectId, req.user.userId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const {
      projectId,
      objective,
      budget,
      product,
      market,
      audience,
      valueProp,
      pains,
      gains,
    } = req.body;

    // Generate ecosystem using AI/logic
    const ecosystemData = generateEcosystem({
      objective,
      budget,
      product,
      market,
      audience,
      valueProp,
      pains,
      gains,
    });

    const ecosystemId = uuidv4();
    const now = Date.now();

    // Begin transaction
    const insertEcosystem = db.transaction(() => {
      // Insert ecosystem
      db.prepare(`
        INSERT INTO ecosystems (
          id, project_id, objective, budget, product, market, audience,
          value_proposition, pains, gains, distribution, total_pieces,
          projected_roas, timeframe, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        ecosystemId,
        projectId,
        objective,
        budget,
        product,
        market || null,
        audience || null,
        valueProp || null,
        (pains || []).join('\n'),
        (gains || []).join('\n'),
        JSON.stringify(ecosystemData.distribution),
        ecosystemData.totalPieces,
        ecosystemData.projectedRoas,
        ecosystemData.timeframe,
        now,
        now
      );

      // Insert content pieces
      const insertPiece = db.prepare(`
        INSERT INTO content_pieces (
          id, ecosystem_id, stage, type, title, description, kpi, budget,
          channel, format, score, pain, gain, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const [stage, pieces] of Object.entries(ecosystemData.pieces)) {
        for (const piece of pieces) {
          insertPiece.run(
            uuidv4(),
            ecosystemId,
            stage,
            piece.type,
            piece.title,
            piece.description,
            piece.kpi,
            piece.budget,
            piece.channel,
            piece.format,
            piece.score,
            piece.pain || null,
            piece.gain || null,
            now
          );
        }
      }
    });

    insertEcosystem();

    // Generate AI insights (async, don't block response)
    let aiInsights = null;
    try {
      const hasAIKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
      if (hasAIKey) {
        aiInsights = await generateEcosystemInsights({
          objective,
          budget,
          product,
          market,
          audience,
          valueProp,
          pains,
          gains,
          currentDistribution: ecosystemData.distribution,
          pieces: ecosystemData.pieces,
        });

        // Save AI insights to database
        const insightId = uuidv4();
        db.prepare(`
          INSERT INTO ai_insights (
            id, ecosystem_id, audience_analysis, budget_optimization,
            competitive_insights, kpi_guidance, enhanced_content, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          insightId,
          ecosystemId,
          JSON.stringify(aiInsights.audienceAnalysis),
          JSON.stringify(aiInsights.budgetOptimization),
          JSON.stringify(aiInsights.competitiveInsights),
          JSON.stringify(aiInsights.kpiGuidance),
          JSON.stringify(aiInsights.enhancedContent),
          now
        );

        console.log(`✓ AI insights generated for ecosystem ${ecosystemId}`);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Continue without AI insights - don't fail the request
    }

    // Emit WebSocket event
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('ecosystem-created', {
      projectId,
      ecosystemId,
      hasAiInsights: !!aiInsights,
    });

    // Get created ecosystem
    const ecosystem = db.prepare('SELECT * FROM ecosystems WHERE id = ?').get(ecosystemId);
    const pieces = db.prepare('SELECT * FROM content_pieces WHERE ecosystem_id = ?').all(ecosystemId);

    res.status(201).json({
      ecosystem,
      pieces,
      aiInsights,
    });
  } catch (error) {
    next(error);
  }
});

// Delete ecosystem
router.delete('/:id', (req, res, next) => {
  try {
    const result = db.prepare(`
      DELETE FROM ecosystems
      WHERE id = ? AND project_id IN (
        SELECT id FROM projects WHERE user_id = ?
      )
    `).run(req.params.id, req.user.userId);

    if (result.changes === 0) {
      throw new AppError('Ecosystem not found', 404);
    }

    res.json({ message: 'Ecosystem deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
