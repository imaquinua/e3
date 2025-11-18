import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Import configurations
import { corsConfig } from '../server/config/cors.js';
import { rateLimiter } from '../server/middleware/rateLimiter.js';
import { errorHandler } from '../server/middleware/errorHandler.js';

// Import routes
import authRoutes from '../server/routes/auth.js';
import projectRoutes from '../server/routes/projects.js';
import ecosystemRoutes from '../server/routes/ecosystems.js';
import analyticsRoutes from '../server/routes/analytics.js';
import exportRoutes from '../server/routes/export.js';
import aiRoutes from '../server/routes/ai.js';
import campaignRoutes from '../server/routes/campaigns.js';
import publicationRoutes from '../server/routes/publications.js';

// Import database
import { initDatabase } from '../server/models/database.js';

// Import AI services
import { initOpenAI } from '../server/services/openai.js';
import { initGemini } from '../server/services/gemini.js';

// Import passport configuration
import passport from '../server/config/passport.js';
import { initializePassport } from '../server/config/passport.js';

// Initialize environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors(corsConfig));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', rateLimiter);

// Initialize Passport
initializePassport();
app.use(passport.initialize());

// Socket.IO not available in serverless - set to null to prevent errors
app.set('io', null);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ecosystems', ecosystemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/publications', publicationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and AI services
let initialized = false;

async function initialize() {
  if (initialized) return;

  try {
    await initDatabase();
    console.log('✓ Database initialized');

    // Initialize AI services based on provider
    const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

    if (AI_PROVIDER === 'gemini' && process.env.GEMINI_API_KEY) {
      initGemini();
      console.log('✓ Gemini AI initialized');
    } else if (AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
      initOpenAI();
      console.log('✓ OpenAI initialized');
    }

    initialized = true;
  } catch (error) {
    console.error('Initialization error:', error);
    // Don't throw in production, let the request continue
  }
}

// Serverless function handler for Vercel
export default async function handler(req, res) {
  // Initialize on first request
  await initialize();

  // Handle the request with Express
  return app(req, res);
}
