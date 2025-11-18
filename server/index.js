import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations
import { corsConfig } from './config/cors.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import ecosystemRoutes from './routes/ecosystems.js';
import analyticsRoutes from './routes/analytics.js';
import exportRoutes from './routes/export.js';
import aiRoutes from './routes/ai.js';
import campaignRoutes from './routes/campaigns.js';
import publicationRoutes from './routes/publications.js';

// Import database
import { initDatabase } from './models/database.js';
import { seedDecisionRules } from './models/seedDecisionRules.js';

// Import AI services
import { initOpenAI } from './services/openai.js';
import { initGemini } from './services/gemini.js';

// Import passport configuration
import passport from './config/passport.js';
import { initializePassport } from './config/passport.js';

// Initialize environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsConfig,
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

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

// Static files (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Health check endpoint
app.get('/health', (req, res) => {
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

// WebSocket handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Socket ${socket.id} joined project:${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`Socket ${socket.id} left project:${projectId}`);
  });

  socket.on('ecosystem-update', (data) => {
    socket.to(`project:${data.projectId}`).emit('ecosystem-updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware (must be last)
app.use(errorHandler);

// Serve index.html for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    console.log('✓ Database initialized');

    await seedDecisionRules();
    console.log('✓ Decision rules seeded');

    // Initialize AI services based on provider
    const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
    let aiStatus = '✗';
    let aiProvider = 'None';

    if (AI_PROVIDER === 'gemini' && process.env.GEMINI_API_KEY) {
      initGemini();
      aiStatus = '✓';
      aiProvider = 'Gemini';
    } else if (AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
      initOpenAI();
      aiStatus = '✓';
      aiProvider = 'OpenAI';
    }

    httpServer.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════╗
║   E³ Content Generator Server          ║
╠════════════════════════════════════════╣
║   Environment: ${process.env.NODE_ENV?.padEnd(24)}║
║   Server: http://${HOST}:${PORT}${' '.repeat(14)}║
║   AI Provider: ${aiProvider.padEnd(20)}    ║
║   AI Status: ${aiStatus}${' '.repeat(24)}    ║
║   Status: Running ✓                    ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { io };
