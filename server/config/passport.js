import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users[0]) {
      done(null, users[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, false);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const { emails, name, photos } = profile;
        const email = emails[0].value;
        const fullName = name.givenName + ' ' + name.familyName;
        const avatar = photos && photos[0] ? photos[0].value : null;

        // Check if user exists
        let [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        let user;
        if (users.length === 0) {
          // Create new user
          const username = fullName.toLowerCase().replace(/\s+/g, '') + '_' + uuidv4().substring(0, 8);
          const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name, avatar_url, role) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, '', fullName, avatar, 'user']
          );

          [users] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
          user = users[0];
        } else {
          user = users[0];
          // Update avatar if changed
          if (avatar && avatar !== user.avatar_url) {
            await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar, user.id]);
            user.avatar_url = avatar;
          }
        }

        // Update last login
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
      passReqToCallback: true,
      scope: ['user:email'],
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const { username, name, emails, avatar_url } = profile;
        const email = emails && emails[0] ? emails[0].value : `${username}@github.com`;
        const fullName = name || username;
        const avatar = avatar_url || null;

        // Check if user exists
        let [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        let user;
        if (users.length === 0) {
          // Create new user
          const generatedUsername = username.toLowerCase() + '_' + uuidv4().substring(0, 8);
          const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name, avatar_url, role) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [generatedUsername, email, '', fullName, avatar, 'user']
          );

          [users] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
          user = users[0];
        } else {
          user = users[0];
          // Update avatar if changed
          if (avatar && avatar !== user.avatar_url) {
            await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar, user.id]);
            user.avatar_url = avatar;
          }
        }

        // Update last login
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        done(null, user);
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        done(error, null);
      }
    }
  )
);

// Helper function to generate JWT token for OAuth user
export const generateTokenForUser = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export default passport;
