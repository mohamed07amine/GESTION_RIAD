/**
 * backend/src/controllers/reservationController.js
 *
 * Handles booking logic:
 *  - POST /reservations  → Create a reservation with overlap detection
 *  - GET  /reservations  → List all reservations (admin)
 *  - GET  /reservations/:id
 *  - PATCH /reservations/:id/statut → Update status (confirm / cancel)
 *
 * CRITICAL BUSINESS RULE:
 *   Before inserting a reservation, we query for any existing NON-CANCELLED
 *   booking on the same chambre whose date range overlaps the requested range.
 *   Overlap condition (Allen's interval algebra):
 *     existing.date_debut < requested.date_fin
 *     AND existing.date_fin > requested.date_debut
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

// ─── GET /reservations ───────────────────────────────────────────────────────

/**
 * Return all reservations (admin view).
 * Optional filter: ?statut=confirmee|en_attente|annulee
 */
const getAllReservations = async (req, res, next) => {
  try {
    const { statut } = req.query;
    let sql = `
      SELECT
        r.*,
        c.nom        AS client_nom,
        c.prenom     AS client_prenom,
        c.email      AS client_email,
        ch.nom       AS chambre_nom,
        ch.type      AS chambre_type,
        ri.nom       AS riad_nom
      FROM reservations r
      JOIN clients  c  ON r.client_id  = c.id
      JOIN chambres ch ON r.chambre_id = ch.id
      JOIN riads    ri ON ch.riad_id   = ri.id
      WHERE 1=1
    `;
    const params = [];

    if (statut) {
      params.push(statut);
      sql += ` AND r.statut = $${params.length}`;
    }

    sql += ' ORDER BY r.date_creation DESC';

    const result = await query(sql, params);
    res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ─── GET /reservations/:id ───────────────────────────────────────────────────

const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
         r.*,
         c.nom    AS client_nom,  c.prenom AS client_prenom,
         c.email  AS client_email,
         ch.nom   AS chambre_nom, ch.type  AS chambre_type,
         ri.nom   AS riad_nom
       FROM reservations r
       JOIN clients  c  ON r.client_id  = c.id
       JOIN chambres ch ON r.chambre_id = ch.id
       JOIN riads    ri ON ch.riad_id   = ri.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Reservation with id ${id} not found.` });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── POST /reservations ──────────────────────────────────────────────────────

/**
 * Create a new reservation.
 *
 * Body must contain:
 *   chambre_id  – integer
 *   date_debut  – ISO date string (YYYY-MM-DD)
 *   date_fin    – ISO date string (YYYY-MM-DD), must be > date_debut
 *   client_nom, client_prenom, client_email – if no client_id provided,
 *     we upsert the client by email.
 *
 * Optional:
 *   client_id   – integer (if the client already exists)
 */
const createReservation = async (req, res, next) => {
  if (handleValidationErrors(req, res)) return;

  const client = await query('BEGIN'); // we use a transaction to ensure atomicity

  try {
    const {
      chambre_id,
      date_debut,
      date_fin,
      client_id: providedClientId,
      client_nom,
      client_prenom,
      client_email,
      client_telephone,
    } = req.body;

    // ── 1. Validate dates ──────────────────────────────────────────────────
    const debut = new Date(date_debut);
    const fin   = new Date(date_fin);

    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
      await query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    if (fin <= debut) {
      await query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'date_fin must be strictly after date_debut.' });
    }

    // ── 2. Check chambre exists ───────────────────────────────────────────
    const chambreCheck = await query('SELECT id, disponible FROM chambres WHERE id = $1', [chambre_id]);
    if (chambreCheck.rowCount === 0) {
      await query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Chambre with id ${chambre_id} not found.` });
    }

    // ── 3. OVERLAP DETECTION (the critical business rule) ────────────────
    //
    // An overlap exists when:
    //   existing.date_debut < requested.date_fin
    //   AND existing.date_fin > requested.date_debut
    //   AND statut != 'annulee'
    //
    const overlapResult = await query(
      `SELECT id, date_debut, date_fin, statut
       FROM reservations
       WHERE chambre_id = $1
         AND statut     != 'annulee'
         AND date_debut  < $3   -- existing starts before requested end
         AND date_fin    > $2   -- existing ends   after  requested start
       LIMIT 1`,
      [chambre_id, date_debut, date_fin]
    );

    if (overlapResult.rowCount > 0) {
      const conflict = overlapResult.rows[0];
      await query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Chambre is already booked from ${conflict.date_debut} to ${conflict.date_fin} (reservation #${conflict.id}, status: ${conflict.statut}).`,
      });
    }

    // ── 4. Resolve or create client ───────────────────────────────────────
    let resolvedClientId = providedClientId;

    if (!resolvedClientId) {
      if (!client_email || !client_nom || !client_prenom) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Provide either client_id or (client_nom, client_prenom, client_email).',
        });
      }

      // Upsert client by email
      const clientUpsert = await query(
        `INSERT INTO clients (nom, prenom, email, telephone)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE
           SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom
         RETURNING id`,
        [client_nom, client_prenom, client_email, client_telephone || null]
      );
      resolvedClientId = clientUpsert.rows[0].id;
    } else {
      // Verify provided client exists
      const clientCheck = await query('SELECT id FROM clients WHERE id = $1', [resolvedClientId]);
      if (clientCheck.rowCount === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ success: false, message: `Client with id ${resolvedClientId} not found.` });
      }
    }

    // ── 5. Insert the reservation ─────────────────────────────────────────
    const insertResult = await query(
      `INSERT INTO reservations (client_id, chambre_id, date_debut, date_fin, statut)
       VALUES ($1, $2, $3, $4, 'en_attente')
       RETURNING *`,
      [resolvedClientId, chambre_id, date_debut, date_fin]
    );

    await query('COMMIT');

    res.status(201).json({ success: true, data: insertResult.rows[0] });
  } catch (err) {
    await query('ROLLBACK');
    next(err);
  }
};

// ─── PATCH /reservations/:id/statut ──────────────────────────────────────────

/**
 * Update the statut of a reservation.
 * Allowed values: 'confirmee' | 'annulee' | 'en_attente'
 */
const updateReservationStatut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const allowed = ['en_attente', 'confirmee', 'annulee'];
    if (!statut || !allowed.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `statut must be one of: ${allowed.join(', ')}.`,
      });
    }

    const result = await query(
      'UPDATE reservations SET statut = $1 WHERE id = $2 RETURNING *',
      [statut, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Reservation with id ${id} not found.` });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservationStatut,
};
