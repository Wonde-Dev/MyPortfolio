import express from 'express';
import passport from '../config/passport.js';
import { login, verifyToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateTokenForUser } from '../config/passport.js';

const router = express.Router();

// Regular login (email/password)
router.post('/login', login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account',
  session: false
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google` 
  }),
  (req, res) => {
    const token = generateTokenForUser(req.user);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/callback?token=${token}&provider=google`);
  }
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'],
  session: false
}));

router.get('/github/callback', 
  passport.authenticate('github', { 
    session: false, 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=github` 
  }),
  (req, res) => {
    const token = generateTokenForUser(req.user);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/callback?token=${token}&provider=github`);
  }
);

// Verify token
router.get('/verify', authenticateToken, verifyToken);

export default router;
