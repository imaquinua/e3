import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../server/database/e3.db');
const db = new Database(dbPath);

async function createDemoUser() {
  const email = 'chumbi@imaquinua.com';
  const password = 't1,2,3aemv';
  const name = 'Chumbi';

  try {
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
      // Update existing user password
      const hashedPassword = await bcrypt.hash(password, 10);
      db.prepare('UPDATE users SET password = ?, name = ? WHERE email = ?')
        .run(hashedPassword, name, email);
      console.log('✅ Usuario actualizado:');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const now = Date.now();

      db.prepare(`
        INSERT INTO users (id, email, password, name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, email, hashedPassword, name, now, now);

      console.log('✅ Usuario creado:');
    }

    console.log('');
    console.log('  📧 Email:    chumbi@imaquinua.com');
    console.log('  🔑 Password: t1,2,3aemv');
    console.log('  👤 Nombre:   Chumbi');
    console.log('');
    console.log('Úsalo para iniciar sesión en: http://localhost:5173');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

createDemoUser();
