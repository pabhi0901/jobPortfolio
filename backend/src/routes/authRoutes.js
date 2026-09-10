import { Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { verifyAdminToken } from '../middleware/auth.js';

dotenv.config();

const router = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'abhi765yt';
const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_super_secret_jwt_key_abhi765yt_2026';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password. Access denied.' });
  }

  // Sign JWT token valid for 7 days
  const token = jwt.sign(
    { role: 'admin', user: 'abhishek' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    token,
    message: 'Authenticated successfully'
  });
});

// GET /api/auth/verify
router.get('/verify', verifyAdminToken, (req, res) => {
  return res.json({
    valid: true,
    user: req.admin
  });
});

export default router;
