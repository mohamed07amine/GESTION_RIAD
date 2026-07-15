/**
 * backend/src/middleware/auth.js
 *
 * Lightweight JWT authentication middleware.
 * Protects admin-level endpoints (POST, PUT, DELETE on riads/chambres).
 *
 * Usage:
 *   router.post('/', authenticate, controller.create);
 *
 * Token format expected in request header:
 *   Authorization: Bearer <jwt_token>
 *
 * To obtain a token during development, use the POST /auth/login route
 * defined in authRoutes.js (admin simulation — credentials in .env).
 */

const jwt = require('jsonwebtoken');

/**
 * authenticate middleware
 * Verifies the JWT token and attaches the decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Expected: Authorization: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid token.' });
  }
};

/**
 * requireAdmin middleware
 * Must be chained after authenticate. Ensures the user has role === 'admin'.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
