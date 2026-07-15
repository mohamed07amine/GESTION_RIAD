/**
 * backend/src/routes/riadRoutes.js
 *
 * Routes for the /riads resource.
 * GET endpoints are public; POST, PUT, DELETE require JWT (admin).
 */

const express = require('express');
const { body } = require('express-validator');

const {
  getAllRiads,
  getRiadById,
  createRiad,
  updateRiad,
  deleteRiad,
} = require('../controllers/riadController');

const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ─── Validation rules ────────────────────────────────────────────────────────

const riadCreateRules = [
  body('nom').notEmpty().withMessage('nom is required.').trim(),
  body('prix_nuit')
    .optional({ checkFalsy: true })
    .isFloat({ gt: 0 })
    .withMessage('prix_nuit must be a positive number.'),
  body('image_url').optional({ checkFalsy: true }).isURL().withMessage('image_url must be a valid URL.'),
];

const riadUpdateRules = [
  body('nom').optional({ checkFalsy: true }).notEmpty().withMessage('nom cannot be empty.').trim(),
  body('prix_nuit')
    .optional({ checkFalsy: true })
    .isFloat({ gt: 0 })
    .withMessage('prix_nuit must be a positive number.'),
  body('image_url').optional({ checkFalsy: true }).isURL().withMessage('image_url must be a valid URL.'),
];

// ─── Public routes ───────────────────────────────────────────────────────────

router.get('/',    getAllRiads);
router.get('/:id', getRiadById);

// ─── Protected routes (admin only) ──────────────────────────────────────────

router.post(  '/',    authenticate, requireAdmin, riadCreateRules, createRiad);
router.put(   '/:id', authenticate, requireAdmin, riadUpdateRules, updateRiad);
router.delete('/:id', authenticate, requireAdmin,                  deleteRiad);

module.exports = router;
