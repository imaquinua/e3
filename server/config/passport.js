import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import sql from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

export function initializePassport() {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await sql`SELECT * FROM users WHERE id = ${id}`;
      done(null, result.rows[0]);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    console.log('✓ Configuring Google OAuth strategy');
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            const existingUser = db
              .prepare('SELECT * FROM users WHERE google_id = ? OR email = ?')
              .get(profile.id, profile.emails[0].value);

            if (existingUser) {
              // Update google_id if not set
              if (!existingUser.google_id) {
                db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(
                  profile.id,
                  existingUser.id
                );
              }
              return done(null, existingUser);
            }

            // Create new user
            const userId = uuidv4();
            const now = Date.now();

            db.prepare(`
              INSERT INTO users (id, email, name, google_id, password, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
              userId,
              profile.emails[0].value,
              profile.displayName || profile.emails[0].value.split('@')[0],
              profile.id,
              '', // No password for Google users
              now,
              now
            );

            const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
            done(null, newUser);
          } catch (error) {
            console.error('Google OAuth error:', error);
            done(error, null);
          }
        }
      )
    );
  } else {
    console.log('⚠ Google OAuth not configured (missing credentials)');
  }
}

export function isGoogleConfigured() {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

export default passport;
