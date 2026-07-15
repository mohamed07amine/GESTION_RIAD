/**
 * backend/src/routes/reservationRoutes.js
 *
 * Routes for the /reservations resource.
 * POST (create) is public — guests book directly.
 * GET and PATCH (admin actions) require JWT.
 */

const express = require('express');
const { body } = require('express-validator');

const {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservationStatut,
} = require('../controllers/reservationController');

const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ─── Validation rules ────────────────────────────────────────────────────────

const reservationCreateRules = [
  body('chambre_id')
    .isInt({ gt: 0 })
    .withMessage('chambre_id must be a positive integer.'),
  body('date_debut')
    .isISO8601()
    .withMessage('date_debut must be a valid date (YYYY-MM-DD).')
    .toDate(),
  body('date_fin')
    .isISO8601()
    .withMessage('date_fin must be a valid date (YYYY-MM-DD).')
    .toDate(),
  // Client info (required if client_id not provided)
  body('client_email')
    .optional()
    .isEmail()
    .withMessage('client_email must be a valid email address.'),
  body('client_id')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('client_id must be a positive integer.'),
];

// ─── Public routes ───────────────────────────────────────────────────────────

// Guests can create a reservation without being logged in
router.post('/', reservationCreateRules, createReservation);

// ─── Admin-only routes ───────────────────────────────────────────────────────

router.get('/',    authenticate, requireAdmin, getAllReservations);
router.get('/:id', authenticate, requireAdmin, getReservationById);
router.patch('/:id/statut', authenticate, requireAdmin, updateReservationStatut);

module.exports = router;
