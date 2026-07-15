/**
 * backend/src/controllers/chambreController.js
 *
 * Handlers for the /chambres and /riads/:id/chambres resources.
 */

const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// ─── Helper ──────────────────────────────────────────────────────────────────

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};

// ─── GET /riads/:id/chambres ─────────────────────────────────────────────────

/**
 * List all chambres for a given riad.
 * Optional filter: ?disponible=true|false
 */
const getChambresByRiad = async (req, res, next) => {
  try {
    const { id } = req.params; // riad id
    const { disponible } = req.query;

    // Verify the riad exists first
    const riadCheck = await query('SELECT id FROM riads WHERE id = $1', [id]);
    if (riadCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Riad with id ${id} not found.` });
    }

    let sql    = 'SELECT * FROM chambres WHERE riad_id = $1';
    const params = [id];

    if (disponible !== undefined) {
      sql += ' AND disponible = $2';
      params.push(disponible === 'true');
    }

    sql += ' ORDER BY id ASC';

    const result = await query(sql, params);
    res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ─── GET /chambres/:id ───────────────────────────────────────────────────────

/**
 * Get a single chambre by its id.
 */
const getChambreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM chambres WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Chambre with id ${id} not found.` });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── POST /chambres ──────────────────────────────────────────────────────────

/**
 * Create a new chambre.
 * Required body fields: riad_id, nom
 * Optional: type, prix_nuit, disponible
 */
const createChambre = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;

  try {
    const { riad_id, nom, type, prix_nuit, disponible } = req.body;

    // Validate the parent riad exists
    const riadCheck = await query('SELECT id FROM riads WHERE id = $1', [riad_id]);
    if (riadCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Riad with id ${riad_id} not found.` });
    }

    const result = await query(
      `INSERT INTO chambres (riad_id, nom, type, prix_nuit, disponible)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        riad_id,
        nom,
        type       || null,
        prix_nuit  ? parseFloat(prix_nuit) : null,
        disponible !== undefined ? Boolean(disponible) : true,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /chambres/:id ───────────────────────────────────────────────────────

/**
 * Update a chambre (partial update supported).
 */
const updateChambre = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;

  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM chambres WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Chambre with id ${id} not found.` });
    }

    const { nom, type, prix_nuit, disponible } = req.body;

    const result = await query(
      `UPDATE chambres
       SET
         nom        = COALESCE($1, nom),
         type       = COALESCE($2, type),
         prix_nuit  = COALESCE($3, prix_nuit),
         disponible = COALESCE($4, disponible)
       WHERE id = $5
       RETURNING *`,
      [
        nom       || null,
        type      || null,
        prix_nuit !== undefined ? parseFloat(prix_nuit) : null,
        disponible !== undefined ? Boolean(disponible)  : null,
        id,
      ]
    );

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /chambres/:id ────────────────────────────────────────────────────

/**
 * Delete a chambre.
 * Will fail with a DB error if active reservations exist (FK RESTRICT).
 */
const deleteChambre = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM chambres WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Chambre with id ${id} not found.` });
    }

    res.status(200).json({ success: true, message: `Chambre ${id} deleted successfully.` });
  } catch (err) {
    // FK violation — reservations still reference this chambre
    if (err.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete chambre: existing reservations reference it.',
      });
    }
    next(err);
  }
};

module.exports = {
  getChambresByRiad,
  getChambreById,
  createChambre,
  updateChambre,
  deleteChambre,
};
