const prisma = require('./prisma');

/**
 * Log an audit trail entry.
 * @param {Object} params
 * @param {string} params.hotelId - Hotel ID
 * @param {string} params.staffId - Staff member performing the action
 * @param {string} params.action - Action performed (e.g., 'order.status_changed')
 * @param {string} params.resource - Resource type (e.g., 'Order', 'Room', 'Booking')
 * @param {string} [params.resourceId] - ID of the affected resource
 * @param {Object} [params.details] - Additional metadata (old/new values, etc.)
 */
async function logAudit({ hotelId, staffId, action, resource, resourceId, details }) {
  try {
    await prisma.auditLog.create({
      data: {
        hotelId,
        staffId,
        action,
        resource,
        resourceId: resourceId || null,
        details: details || {},
      },
    });
  } catch (err) {
    // Audit logging should never crash the main operation
    console.error('[AuditLog] Failed to write audit entry:', err.message);
  }
}

module.exports = { logAudit };
