import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/e3.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const initDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      google_id TEXT UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'draft',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Ecosystems table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ecosystems (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      objective TEXT NOT NULL,
      budget REAL NOT NULL,
      product TEXT NOT NULL,
      market TEXT,
      audience TEXT,
      value_proposition TEXT,
      pains TEXT,
      gains TEXT,
      distribution TEXT NOT NULL,
      total_pieces INTEGER NOT NULL,
      projected_roas REAL,
      timeframe TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Content pieces table
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_pieces (
      id TEXT PRIMARY KEY,
      ecosystem_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      kpi TEXT,
      budget REAL NOT NULL,
      channel TEXT,
      format TEXT,
      score INTEGER,
      pain TEXT,
      gain TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (ecosystem_id) REFERENCES ecosystems(id) ON DELETE CASCADE
    )
  `);

  // Analytics/Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event_type TEXT NOT NULL,
      event_data TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // AI Insights table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_insights (
      id TEXT PRIMARY KEY,
      ecosystem_id TEXT NOT NULL,
      audience_analysis TEXT,
      budget_optimization TEXT,
      competitive_insights TEXT,
      kpi_guidance TEXT,
      enhanced_content TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (ecosystem_id) REFERENCES ecosystems(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_ecosystems_project_id ON ecosystems(project_id);
    CREATE INDEX IF NOT EXISTS idx_content_pieces_ecosystem_id ON content_pieces(ecosystem_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_insights_ecosystem_id ON ai_insights(ecosystem_id);
  `);

  console.log('Database schema initialized successfully');
};

export default db;
