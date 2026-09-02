const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

// Permission cache: Map<staffId, Set<string>> — cleared per-request via req-level store
const permissionCache = new Map();

/**
 * Returns a Set of permission strings (e.g. "rooms:read") for the given staff,
 * cached for the lifetime of the process (invalidated on role changes).
 */
async function getStaffPermissions(staffId) {
  if (permissionCache.has(staffId)) return permissionCache.get(staffId);

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

  permissionCache.set(staffId, perms);
  return perms;
}

/**
 * Clear cached permissions for a staff member (call after role changes).
 */
function clearStaffPermissions(staffId) {
  permissionCache.delete(staffId);
}

/**
 * Middleware factory: requirePermission(resource, action)
 * Checks whether req.staff holds a permission matching `${resource}:${action}`.
 * Uses only the RBAC system (StaffRoleAssignment) — no legacy role bypass.
 */
function requirePermission(resource, action) {
  return async (req, res, next) => {
    try {
      if (!req.staff) {
        return next(new ApiError(401, 'Authentication required'));
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

/**
 * Build the full permission set for a staff member (for frontend consumption).
 */
async function getStaffPermissionSet(staffId) {
  const perms = await getStaffPermissions(staffId);
  return [...perms];
}

module.exports = { requirePermission, getStaffPermissions, getStaffPermissionSet, clearStaffPermissions };
