import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { chatAssistant } from '../services/aiAgent.js';
import db from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Chat with AI assistant
 * POST /api/ai/chat
 */
router.post('/chat', [
  body('message').trim().isLength({ min: 1, max: 2000 }),
  body('conversationHistory').optional().isArray(),
  body('context').optional().isObject(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hasAIKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!hasAIKey) {
      return res.status(503).json({
        error: 'AI assistant not available',
        message: 'AI API key not configured',
      });
    }

    const { message, conversationHistory = [], context = {} } = req.body;

    // Track analytics
    const eventId = uuidv4();
    db.prepare(`
      INSERT INTO analytics_events (id, user_id, event_type, event_data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      eventId,
      req.user.userId,
      'ai_chat_query',
      JSON.stringify({ messageLength: message.length, hasContext: Object.keys(context).length > 0 }),
      Date.now()
    );

    const response = await chatAssistant({
      message,
      conversationHistory,
      context,
    });

    res.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get AI insights for a specific ecosystem
 * GET /api/ai/insights/:ecosystemId
 */
router.get('/insights/:ecosystemId', async (req, res, next) => {
  try {
    const { ecosystemId } = req.params;

    // Verify ecosystem belongs to user
    const ecosystem = db.prepare(`
      SELECT e.id FROM ecosystems e
      JOIN projects p ON e.project_id = p.id
      WHERE e.id = ? AND p.user_id = ?
    `).get(ecosystemId, req.user.userId);

    if (!ecosystem) {
      return res.status(404).json({ error: 'Ecosystem not found' });
    }

    // Get AI insights
    const insightsRow = db.prepare(`
      SELECT * FROM ai_insights WHERE ecosystem_id = ?
    `).get(ecosystemId);

    if (!insightsRow) {
      return res.status(404).json({
        error: 'No AI insights available for this ecosystem',
        message: 'Insights may still be generating or AI features were not enabled',
      });
    }

    const insights = {
      audienceAnalysis: JSON.parse(insightsRow.audience_analysis),
      budgetOptimization: JSON.parse(insightsRow.budget_optimization),
      competitiveInsights: JSON.parse(insightsRow.competitive_insights),
      kpiGuidance: insightsRow.kpi_guidance ? JSON.parse(insightsRow.kpi_guidance) : null,
      enhancedContent: insightsRow.enhanced_content ? JSON.parse(insightsRow.enhanced_content) : null,
      generatedAt: new Date(insightsRow.created_at).toISOString(),
    };

    res.json({ insights });
  } catch (error) {
    next(error);
  }
});

/**
 * Health check for AI services
 * GET /api/ai/health
 */
router.get('/health', (req, res) => {
  const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  const aiEnabled = hasGeminiKey || hasOpenAIKey;
  const provider = AI_PROVIDER === 'gemini' ? 'Google Gemini' : 'OpenAI';
  const model = AI_PROVIDER === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o';

  res.json({
    aiEnabled,
    provider: aiEnabled ? provider : null,
    model: aiEnabled ? model : null,
    features: {
      audienceAnalysis: aiEnabled,
      budgetOptimization: aiEnabled,
      competitiveInsights: aiEnabled,
      chatAssistant: aiEnabled,
      kpiGuidance: aiEnabled,
    },
  });
});

export default router;
