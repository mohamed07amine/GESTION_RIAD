/**
 * backend/src/config/db.js
 *
 * PostgreSQL connection pool using the 'pg' library.
 * All connection parameters are loaded from environment variables.
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'riad_manager',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
  // Keep a minimum of 2 idle connections, allow up to 10 concurrent
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000, // close idle clients after 30 s
  connectionTimeoutMillis: 2000, // fail fast if no connection available
});

// Emit a warning on unexpected pool errors (e.g. lost DB connection)
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

/**
 * Thin helper so controllers can run parameterised queries without
 * importing pool directly.
 *
 * @param {string} text   - SQL query string
 * @param {Array}  params - Bound parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
