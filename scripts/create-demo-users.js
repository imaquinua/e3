import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./server/database/e3.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const users = [
  { email: 'jeanpierre@imaquinua.com', password: 'jp2025', name: 'Jean Pierre' },
  { email: 'sebastian@imaquinua.com', password: 'sebas2025', name: 'Sebastian' },
  { email: 'fio@imaquinua.com', password: 'fio2025', name: 'Fio' },
];

async function createUsers() {
  try {
    console.log('Creating demo users...\n');

    for (const user of users) {
      // Check if user already exists
      const existingUserResult = await db.execute({
        sql: 'SELECT id FROM users WHERE email = ?',
        args: [user.email]
      });

      if (existingUserResult.rows.length > 0) {
        console.log(`❌ User ${user.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Create user
      const userId = uuidv4();
      const now = Date.now();

      await db.execute({
        sql: `
          INSERT INTO users (id, email, password, name, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [userId, user.email, hashedPassword, user.name, now, now]
      });

      console.log(`✅ Created user: ${user.email} (${user.name})`);
      console.log(`   Password: ${user.password}`);
      console.log(`   User ID: ${userId}\n`);
    }

    console.log('\n✨ All users created successfully!');
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
}

createUsers();
