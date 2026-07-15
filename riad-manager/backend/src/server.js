/**
 * backend/src/server.js
 *
 * Express application entry point.
 *
 * Responsibilities:
 *  - Load environment variables (dotenv)
 *  - Create Express app with middleware (CORS, JSON parsing, request logging)
 *  - Mount API routes
 *  - Global error-handling middleware
 *  - Verify DB connectivity on startup
 *  - Start HTTP server
 */

// ── Load environment variables FIRST ─────────────────────────────────────────
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const { pool }   = require('./config/db');

// Route modules
const riadRoutes        = require('./routes/riadRoutes');
const chambreRoutes     = require('./routes/chambreRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes        = require('./routes/authRoutes');

// ─── App setup ────────────────────────────────────────────────────────────────

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * CORS — allow requests from the Next.js frontend dev server.
 * In production, restrict to your domain.
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON bodies (limit set to avoid large payload attacks)
app.use(express.json({ limit: '10kb' }));

// Simple request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ─── API Routes ──────────────────────────────────────────────────────────────

app.use('/api/auth',         authRoutes);
app.use('/api/riads',        riadRoutes);

// Nested: GET /api/riads/:id/chambres
app.use('/api/riads/:id/chambres', chambreRoutes);

// Standalone: POST, PUT, DELETE /api/chambres
app.use('/api/chambres',     chambreRoutes);

app.use('/api/reservations', reservationRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global error handler ─────────────────────────────────────────────────────

/**
 * Express error-handling middleware (4 arguments).
 * Catches all errors forwarded via next(err).
 */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);

  // PostgreSQL-specific error codes
  if (err.code === '23505') {
    // unique_violation
    return res.status(409).json({ success: false, message: 'Duplicate entry: ' + err.detail });
  }
  if (err.code === '23503') {
    // foreign_key_violation
    return res.status(409).json({ success: false, message: 'Foreign key violation: ' + err.detail });
  }
  if (err.code === '23514') {
    // check_violation
    return res.status(400).json({ success: false, message: 'Constraint violation: ' + err.detail });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error.' : err.message,
    // Expose stack trace in development only
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────

const startServer = async () => {
  // Verify DB is reachable before accepting traffic
  try {
    await pool.query('SELECT NOW()');
    console.log('[DB] PostgreSQL connected successfully.');
  } catch (err) {
    console.error('[DB] Failed to connect to PostgreSQL:', err.message);
    console.warn('[DB] Server will start anyway — check your .env DB settings.');
  }

  app.listen(PORT, () => {
    console.log(`[SERVER] Riad Manager API running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[SERVER] Health check: http://localhost:${PORT}/health`);
  });
};

startServer();

module.exports = app; // Export for testing
