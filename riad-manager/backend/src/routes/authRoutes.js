/**
 * backend/src/routes/authRoutes.js
 *
 * Admin simulation login endpoint.
 * POST /auth/login → returns a signed JWT.
 *
 * In production, replace hardcoded admin with a DB lookup + bcrypt check.
 * Credentials are stored in .env:
 *   ADMIN_EMAIL=admin@riad.ma
 *   ADMIN_PASSWORD=admin123
 */

const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');

const router = express.Router();

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required.' });
    }

    // Simulated admin account (swap for DB lookup in real use)
    const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@riad.ma';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Compare password — either plaintext (dev) or bcrypt hash
    const isValid = ADMIN_PASSWORD.startsWith('$2')
      ? await bcrypt.compare(password, ADMIN_PASSWORD)
      : password === ADMIN_PASSWORD;

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: 1, email: ADMIN_EMAIL, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
