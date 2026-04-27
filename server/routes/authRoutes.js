import express from 'express';
import { login, verifyToken, googleAuth } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/google', googleAuth);
router.get('/verify', authenticateToken, verifyToken);

export default router;