const prisma = require('../utils/prisma');
const catchAsync = require('../utils/catchAsync');

// GET /api/admin/reports/dashboard
exports.getDashboardStats = catchAsync(async (req, res) => {
  const hotelId = req.staff.hotelId;
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const [totalRooms, occupiedRooms, todayOrders, activeServiceRequests, roomStatusCounts] =
    await Promise.all([
      prisma.room.count({ where: { hotelId, isActive: true } }),
      prisma.room.count({ where: { hotelId, isActive: true, status: 'OCCUPIED' } }),
      prisma.order.findMany({
        where: { hotelId, createdAt: { gte: startOfDay } },
        select: { status: true, total: true },
      }),
      prisma.serviceRequest.count({
        where: { hotelId, status: { in: ['PENDING', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS'] } },
      }),
      prisma.room.groupBy({
        by: ['status'],
        where: { hotelId, isActive: true },
        _count: { id: true },
      }),
    ]);

  const totalOrderRevenue = todayOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const roomStatusSummary = {};
  for (const r of roomStatusCounts) {
    roomStatusSummary[r.status] = r._count.id;
  }

  res.json({
    success: true,
    data: {
      occupancy: {
        totalRooms,
        occupiedRooms,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      },
      todayOrders: {
        total: todayOrders.length,
        revenue: totalOrderRevenue,
        active: todayOrders.filter((o) => ['PENDING', 'ACCEPTED', 'READY'].includes(o.status)).length,
      },
      activeServiceRequests,
      roomStatusSummary,
    },
  });
});

// GET /api/admin/reports/occupancy
exports.getOccupancyReport = catchAsync(async (req, res) => {
  const hotelId = req.staff.hotelId;

  const rooms = await prisma.room.findMany({
    where: { hotelId, isActive: true },
    select: { id: true, status: true, roomType: { select: { id: true, name: true } } },
  });

  const total = rooms.length;
  const occupied = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const available = rooms.filter((r) => r.status === 'READY').length;
  const outOfOrder = rooms.filter((r) => ['OUT_OF_ORDER', 'MAINTENANCE'].includes(r.status)).length;
  const dirty = rooms.filter((r) => ['DIRTY', 'CLEANING', 'INSPECTED'].includes(r.status)).length;

  const byRoomType = {};
  for (const r of rooms) {
    const typeName = r.roomType.name;
    if (!byRoomType[typeName]) {
      byRoomType[typeName] = { total: 0, occupied: 0, available: 0 };
    }
    byRoomType[typeName].total++;
    if (r.status === 'OCCUPIED') byRoomType[typeName].occupied++;
    if (r.status === 'READY') byRoomType[typeName].available++;
  }

  res.json({
    success: true,
    data: {
      total,
      occupied,
      available,
      outOfOrder,
      dirty,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      byRoomType,
    },
  });
});

// GET /api/admin/reports/orders?from=&to=
exports.getOrderStats = catchAsync(async (req, res) => {
  const hotelId = req.staff.hotelId;
  const { from, to } = req.query;

  const where = { hotelId };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const orders = await prisma.order.findMany({
    where,
    select: { status: true, total: true, createdAt: true },
  });

  const byStatus = {};
  let totalRevenue = 0;
  for (const o of orders) {
    if (!byStatus[o.status]) byStatus[o.status] = { count: 0, revenue: 0 };
    byStatus[o.status].count++;
    if (o.status !== 'CANCELLED') totalRevenue += Number(o.total);
  }

  const statusSummary = Object.entries(byStatus).map(([status, data]) => ({
    status,
    count: data.count,
    revenue: data.revenue,
  }));

  res.json({
    success: true,
    data: {
      totalOrders: orders.length,
      totalRevenue,
      statusSummary,
    },
  });
});
