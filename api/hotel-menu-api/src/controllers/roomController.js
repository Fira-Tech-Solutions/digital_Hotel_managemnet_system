const { z } = require('zod');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createRoomSchema = z.object({
  roomTypeId: z.string().uuid(),
  number: z.string().min(1),
  floor: z.number().int().optional(),
});

const updateRoomSchema = z.object({
  roomTypeId: z.string().uuid().optional(),
  number: z.string().min(1).optional(),
  floor: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const createRoomTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number(),
  maxCapacity: z.number().int().min(1).default(2),
  bedType: z.string().optional(),
  sizeSqm: z.number().int().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
});

const updateRoomTypeSchema = createRoomTypeSchema.partial();

// GET /api/admin/rooms?status=
exports.listRooms = catchAsync(async (req, res) => {
  const { status } = req.query;

  const where = { hotelId: req.staff.hotelId, isActive: true };
  if (status) {
    const statuses = String(status).split(',');
    where.status = { in: statuses };
  }

  const rooms = await prisma.room.findMany({
    where,
    include: { roomType: { select: { id: true, name: true, basePrice: true } } },
    orderBy: [{ floor: 'asc' }, { number: 'asc' }],
  });

  res.json({ success: true, data: rooms });
});

// GET /api/admin/rooms/types
exports.listRoomTypes = catchAsync(async (req, res) => {
  const roomTypes = await prisma.roomType.findMany({
    where: { hotelId: req.staff.hotelId },
    include: {
      _count: { select: { rooms: { where: { isActive: true } } } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const data = roomTypes.map((rt) => ({
    id: rt.id,
    name: rt.name,
    description: rt.description,
    basePrice: rt.basePrice,
    maxCapacity: rt.maxCapacity,
    bedType: rt.bedType,
    sizeSqm: rt.sizeSqm,
    amenities: rt.amenities,
    images: rt.images,
    isActive: rt.isActive,
    sortOrder: rt.sortOrder,
    roomCount: rt._count.rooms,
    createdAt: rt.createdAt,
    updatedAt: rt.updatedAt,
  }));

  res.json({ success: true, data });
});

// POST /api/admin/rooms
exports.createRoom = catchAsync(async (req, res) => {
  const body = createRoomSchema.parse(req.body);

  const roomType = await prisma.roomType.findFirst({
    where: { id: body.roomTypeId, hotelId: req.staff.hotelId },
  });
  if (!roomType) throw new ApiError(404, 'Room type not found');

  const existing = await prisma.room.findFirst({
    where: { hotelId: req.staff.hotelId, number: body.number },
  });
  if (existing) throw new ApiError(409, 'A room with this number already exists');

  const room = await prisma.room.create({
    data: {
      hotelId: req.staff.hotelId,
      roomTypeId: body.roomTypeId,
      number: body.number,
      floor: body.floor,
    },
    include: { roomType: { select: { id: true, name: true } } },
  });

  res.status(201).json({ success: true, data: room });
});

// PATCH /api/admin/rooms/:id
exports.updateRoom = catchAsync(async (req, res) => {
  const { id } = req.params;
  const body = updateRoomSchema.parse(req.body);

  const room = await prisma.room.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!room) throw new ApiError(404, 'Room not found');

  if (body.number && body.number !== room.number) {
    const dup = await prisma.room.findFirst({
      where: { hotelId: req.staff.hotelId, number: body.number, id: { not: id } },
    });
    if (dup) throw new ApiError(409, 'A room with this number already exists');
  }

  const updated = await prisma.room.update({
    where: { id },
    data: body,
    include: { roomType: { select: { id: true, name: true } } },
  });

  res.json({ success: true, data: updated });
});

// PATCH /api/admin/rooms/:id/status
exports.updateRoomStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = z
    .object({ status: z.enum(['READY', 'OCCUPIED', 'DIRTY', 'CLEANING', 'INSPECTED', 'OUT_OF_ORDER', 'MAINTENANCE']) })
    .parse(req.body);

  const room = await prisma.room.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!room) throw new ApiError(404, 'Room not found');

  const updated = await prisma.room.update({
    where: { id },
    data: { status },
    include: { roomType: { select: { id: true, name: true } } },
  });

  res.json({ success: true, data: updated });
});

// POST /api/admin/rooms/types
exports.createRoomType = catchAsync(async (req, res) => {
  const body = createRoomTypeSchema.parse(req.body);

  const roomType = await prisma.roomType.create({
    data: {
      hotelId: req.staff.hotelId,
      name: body.name,
      description: body.description,
      basePrice: body.basePrice,
      maxCapacity: body.maxCapacity,
      bedType: body.bedType,
      sizeSqm: body.sizeSqm,
      amenities: body.amenities,
      images: body.images,
    },
  });

  res.status(201).json({ success: true, data: roomType });
});

// PATCH /api/admin/rooms/types/:id
exports.updateRoomType = catchAsync(async (req, res) => {
  const { id } = req.params;
  const body = updateRoomTypeSchema.parse(req.body);

  const roomType = await prisma.roomType.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!roomType) throw new ApiError(404, 'Room type not found');

  const updated = await prisma.roomType.update({
    where: { id },
    data: body,
  });

  res.json({ success: true, data: updated });
});
