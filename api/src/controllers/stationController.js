const { z } = require('zod');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createStationSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).toUpperCase(),
  departmentId: z.string().uuid(),
  deviceIdentifier: z.string().optional(),
});

const updateStationSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).toUpperCase().optional(),
  departmentId: z.string().uuid().optional(),
  deviceIdentifier: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/stations
exports.listStations = catchAsync(async (req, res) => {
  const { departmentId } = req.query;

  const where = { hotelId: req.staff.hotelId, isActive: true };
  if (departmentId) where.departmentId = departmentId;

  const stations = await prisma.serviceStation.findMany({
    where,
    include: { department: { select: { id: true, name: true, code: true } } },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: stations });
});

// GET /api/admin/stations/:id
exports.getStation = catchAsync(async (req, res) => {
  const station = await prisma.serviceStation.findFirst({
    where: { id: req.params.id, hotelId: req.staff.hotelId },
    include: {
      department: { select: { id: true, name: true, code: true } },
      devices: true,
    },
  });

  if (!station) throw new ApiError(404, 'Station not found');
  res.json({ success: true, data: station });
});

// POST /api/admin/stations
exports.createStation = catchAsync(async (req, res) => {
  const body = createStationSchema.parse(req.body);

  const department = await prisma.department.findFirst({
    where: { id: body.departmentId, hotelId: req.staff.hotelId },
  });
  if (!department) throw new ApiError(404, 'Department not found');

  const existing = await prisma.serviceStation.findFirst({
    where: { hotelId: req.staff.hotelId, code: body.code },
  });
  if (existing) throw new ApiError(409, 'A station with this code already exists');

  const station = await prisma.serviceStation.create({
    data: {
      hotelId: req.staff.hotelId,
      departmentId: body.departmentId,
      name: body.name,
      code: body.code,
      deviceIdentifier: body.deviceIdentifier,
    },
    include: { department: { select: { id: true, name: true, code: true } } },
  });

  res.status(201).json({ success: true, data: station });
});

// PATCH /api/admin/stations/:id
exports.updateStation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const body = updateStationSchema.parse(req.body);

  const station = await prisma.serviceStation.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!station) throw new ApiError(404, 'Station not found');

  if (body.code && body.code !== station.code) {
    const dup = await prisma.serviceStation.findFirst({
      where: { hotelId: req.staff.hotelId, code: body.code, id: { not: id } },
    });
    if (dup) throw new ApiError(409, 'A station with this code already exists');
  }

  const updated = await prisma.serviceStation.update({
    where: { id },
    data: body,
    include: { department: { select: { id: true, name: true, code: true } } },
  });

  res.json({ success: true, data: updated });
});

// DELETE /api/admin/stations/:id
exports.deleteStation = catchAsync(async (req, res) => {
  const { id } = req.params;

  const station = await prisma.serviceStation.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!station) throw new ApiError(404, 'Station not found');

  const updated = await prisma.serviceStation.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({ success: true, data: updated });
});

// PATCH /api/admin/stations/:id/status
exports.updateStationStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = z
    .object({ status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE']) })
    .parse(req.body);

  const station = await prisma.serviceStation.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!station) throw new ApiError(404, 'Station not found');

  const updated = await prisma.serviceStation.update({
    where: { id },
    data: { status, lastSeenAt: status === 'ONLINE' ? new Date() : undefined },
  });

  res.json({ success: true, data: updated });
});
