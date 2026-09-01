const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

// Permission cache scoped to the request lifecycle
const permissionCache = new WeakMap();

/**
 * Returns a Set of permission strings (e.g. "rooms:read") for the given staff,
 * cached for the duration of the request.
 */
async function getStaffPermissions(staffId) {
  const cacheKey = { staffId };
  if (permissionCache.has(cacheKey)) return permissionCache.get(cacheKey);

  const assignments = await prisma.staffRoleAssignment.findMany({
    where: { staffId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  const perms = new Set();
  for (const a of assignments) {
    for (const rp of a.role.permissions) {
      perms.add(`${rp.permission.resource}:${rp.permission.action}`);
    }
  }

  permissionCache.set(cacheKey, perms);
  return perms;
}

/**
 * Middleware factory: requirePermission(resource, action)
 * Checks whether req.staff holds a permission matching `${resource}:${action}`.
 * Falls back to legacy role check (OWNER/MANAGER bypass) for backward compat.
 */
function requirePermission(resource, action) {
  return async (req, res, next) => {
    try {
      if (!req.staff) {
        return next(new ApiError(401, 'Authentication required'));
      }

      // Legacy bypass: OWNER and MANAGER always pass
      if (req.staff.role === 'OWNER' || req.staff.role === 'MANAGER') {
        return next();
      }

      const perms = await getStaffPermissions(req.staff.id);
      if (perms.has(`${resource}:${action}`)) {
        return next();
      }

      return next(new ApiError(403, 'You do not have permission to perform this action'));
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requirePermission, getStaffPermissions };
