const prisma = require('../utils/prisma');
const catchAsync = require('../utils/catchAsync');

// GET /api/admin/audit-logs?resource=&action=&staffId=&from=&to=&page=1
exports.listAuditLogs = catchAsync(async (req, res) => {
  const { resource, action, staffId, from, to } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const take = 50;
  const skip = (page - 1) * take;

  const where = { hotelId: req.staff.hotelId };
  if (resource) where.resource = resource;
  if (action) where.action = action;
  if (staffId) where.staffId = staffId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        staff: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: { page, perPage: take, total, totalPages: Math.ceil(total / take) },
  });
});
