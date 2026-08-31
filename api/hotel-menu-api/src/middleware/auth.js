const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const prisma = require('../utils/prisma');

// Verifies the JWT and attaches the staff record to req.staff.
// Used on all /api/admin/* routes.
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const staff = await prisma.staff.findUnique({ where: { id: payload.staffId } });
    if (!staff || !staff.isActive) {
      throw new ApiError(401, 'Invalid or expired session');
    }

    req.staff = staff;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

// Restricts a route to specific staff roles, e.g. requireRole('OWNER', 'MANAGER')
const requireRole = (...roles) => (req, res, next) => {
  if (!req.staff || !roles.includes(req.staff.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }
  next();
};

module.exports = { requireAuth, requireRole };
