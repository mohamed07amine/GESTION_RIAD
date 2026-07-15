/**
 * backend/src/controllers/riadController.js
 *
 * Full CRUD handlers for the /riads resource.
 * Every handler follows the pattern:
 *   - Validate input
 *   - Execute parameterised SQL query
 *   - Return appropriate HTTP status + JSON body
 */

const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Sends a 400 response with the first validation error found.
 * Returns true if errors existed (caller should return early).
 */
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};

// ─── GET /riads ─────────────────────────────────────────────────────────────

/**
 * List all riads.
 * Optional query params: ?ville=Marrakech&min_prix=500&max_prix=2000&search=Al
 */
const getAllRiads = async (req, res, next) => {
  try {
    const { ville, min_prix, max_prix, search } = req.query;

    let sql    = 'SELECT * FROM riads WHERE 1=1';
    const params = [];
    let idx    = 1;

    if (ville) {
      sql += ` AND LOWER(ville) = LOWER($${idx++})`;
      params.push(ville);
    }
    if (min_prix) {
      sql += ` AND prix_nuit >= $${idx++}`;
      params.push(parseFloat(min_prix));
    }
    if (max_prix) {
      sql += ` AND prix_nuit <= $${idx++}`;
      params.push(parseFloat(max_prix));
    }
    if (search) {
      sql += ` AND (LOWER(nom) LIKE $${idx} OR LOWER(description) LIKE $${idx})`;
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    sql += ' ORDER BY date_creation DESC';

    const result = await query(sql, params);
    res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ─── GET /riads/:id ──────────────────────────────────────────────────────────

/**
 * Get a single riad by its primary key.
 */
const getRiadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM riads WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Riad with id ${id} not found.` });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── POST /riads ─────────────────────────────────────────────────────────────

/**
 * Create a new riad.
 * Required body fields: nom
 * Optional: ville, adresse, description, prix_nuit, image_url
 */
const createRiad = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;

  try {
    const { nom, ville, adresse, description, prix_nuit, image_url } = req.body;

    const result = await query(
      `INSERT INTO riads (nom, ville, adresse, description, prix_nuit, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nom, ville || null, adresse || null, description || null, prix_nuit || null, image_url || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /riads/:id ──────────────────────────────────────────────────────────

/**
 * Update an existing riad (partial update supported — only provided fields change).
 */
const updateRiad = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;

  try {
    const { id } = req.params;

    // First confirm the riad exists
    const existing = await query('SELECT id FROM riads WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Riad with id ${id} not found.` });
    }

    const { nom, ville, adresse, description, prix_nuit, image_url } = req.body;

    const result = await query(
      `UPDATE riads
       SET
         nom          = COALESCE($1, nom),
         ville        = COALESCE($2, ville),
         adresse      = COALESCE($3, adresse),
         description  = COALESCE($4, description),
         prix_nuit    = COALESCE($5, prix_nuit),
         image_url    = COALESCE($6, image_url)
       WHERE id = $7
       RETURNING *`,
      [
        nom       || null,
        ville     || null,
        adresse   || null,
        description || null,
        prix_nuit !== undefined ? parseFloat(prix_nuit) : null,
        image_url || null,
        id,
      ]
    );

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /riads/:id ───────────────────────────────────────────────────────

/**
 * Delete a riad by id.
 * Cascades to chambres (and their reservations, handled at DB level).
 */
const deleteRiad = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM riads WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Riad with id ${id} not found.` });
    }

    res.status(200).json({ success: true, message: `Riad ${id} deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRiads,
  getRiadById,
  createRiad,
  updateRiad,
  deleteRiad,
};
