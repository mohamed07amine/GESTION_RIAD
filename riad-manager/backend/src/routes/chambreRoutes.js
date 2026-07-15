/**
 * backend/src/routes/chambreRoutes.js
 *
 * Routes for the /chambres and /riads/:id/chambres resources.
 * GET endpoints are public; POST, PUT, DELETE require JWT (admin).
 */

const express = require('express');
const { body } = require('express-validator');

const {
  getChambresByRiad,
  getChambreById,
  createChambre,
  updateChambre,
  deleteChambre,
} = require('../controllers/chambreController');

const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); // allows :id from /riads/:id/chambres

// ─── Validation rules ────────────────────────────────────────────────────────

const chambreCreateRules = [
  body('nom').notEmpty().withMessage('nom is required.').trim(),
  body('riad_id').isInt({ gt: 0 }).withMessage('riad_id must be a positive integer.'),
  body('prix_nuit')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('prix_nuit must be a positive number.'),
  body('disponible').optional().isBoolean().withMessage('disponible must be a boolean.'),
];

const chambreUpdateRules = [
  body('nom').optional().notEmpty().withMessage('nom cannot be empty.').trim(),
  body('prix_nuit')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('prix_nuit must be a positive number.'),
  body('disponible').optional().isBoolean().withMessage('disponible must be a boolean.'),
];

// ─── Routes mounted at /riads/:id/chambres (via server.js) ──────────────────
// These use mergeParams so req.params.id = riad id
router.get('/', getChambresByRiad);

// ─── Routes mounted at /chambres ────────────────────────────────────────────
router.get(   '/:id', getChambreById);
router.post(  '/',    authenticate, requireAdmin, chambreCreateRules, createChambre);
router.put(   '/:id', authenticate, requireAdmin, chambreUpdateRules, updateChambre);
router.delete('/:id', authenticate, requireAdmin,                     deleteChambre);

module.exports = router;
