const { z } = require('zod');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { logAudit } = require('../utils/audit');
const { emitBookingUpdated } = require('../sockets');

const createBookingSchema = z.object({
  guestId: z.string().uuid(),
  roomId: z.string().uuid().optional().nullable(),
  roomTypeId: z.string().uuid(),
  locationId: z.string().uuid().optional().nullable(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  totalPrice: z.number(),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
});

const updateBookingSchema = z.object({
  roomId: z.string().uuid().optional().nullable(),
  roomTypeId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional().nullable(),
  checkInDate: z.string().datetime().optional(),
  checkOutDate: z.string().datetime().optional(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  totalPrice: z.number().optional(),
  specialRequests: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const BOOKING_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['CHECKED_OUT'],
  CHECKED_OUT: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const timestampField = {
  CHECKED_IN: 'actualCheckIn',
  CHECKED_OUT: 'actualCheckOut',
  CANCELLED: 'cancelledAt',
};

// GET /api/admin/bookings?status=&checkInFrom=&checkInTo=&page=1
exports.listBookings = catchAsync(async (req, res) => {
  const { status, checkInFrom, checkInTo } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const take = 20;
  const skip = (page - 1) * take;

  const where = { hotelId: req.staff.hotelId };
  if (status) {
    const statuses = String(status).split(',');
    where.status = { in: statuses };
  }
  if (checkInFrom || checkInTo) {
    where.checkInDate = {};
    if (checkInFrom) where.checkInDate.gte = new Date(checkInFrom);
    if (checkInTo) where.checkInDate.lte = new Date(checkInTo);
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        guest: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        roomType: { select: { id: true, name: true } },
        room: { select: { id: true, number: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  res.json({
    success: true,
    data: bookings,
    pagination: { page, perPage: take, total, totalPages: Math.ceil(total / take) },
  });
});

// GET /api/admin/bookings/:id
exports.getBooking = catchAsync(async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, hotelId: req.staff.hotelId },
    include: {
      guest: true,
      roomType: true,
      room: true,
      location: true,
      orders: { orderBy: { createdAt: 'desc' } },
      serviceRequests: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json({ success: true, data: booking });
});

// POST /api/admin/bookings
exports.createBooking = catchAsync(async (req, res) => {
  const body = createBookingSchema.parse(req.body);

  const guest = await prisma.guest.findFirst({
    where: { id: body.guestId, hotelId: req.staff.hotelId },
  });
  if (!guest) throw new ApiError(404, 'Guest not found');

  const roomType = await prisma.roomType.findFirst({
    where: { id: body.roomTypeId, hotelId: req.staff.hotelId },
  });
  if (!roomType) throw new ApiError(404, 'Room type not found');

  if (body.roomId) {
    const room = await prisma.room.findFirst({
      where: { id: body.roomId, hotelId: req.staff.hotelId },
    });
    if (!room) throw new ApiError(404, 'Room not found');

    // Check for overlapping confirmed bookings on the same room
    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId: body.roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        id: { not: undefined },
        AND: [
          { checkInDate: { lt: new Date(body.checkOutDate) } },
          { checkOutDate: { gt: new Date(body.checkInDate) } },
        ],
      },
    });
    if (overlapping) {
      throw new ApiError(409, 'Room is not available for the selected dates');
    }
  }

  const booking = await prisma.booking.create({
    data: {
      hotelId: req.staff.hotelId,
      guestId: body.guestId,
      roomId: body.roomId,
      roomTypeId: body.roomTypeId,
      locationId: body.locationId,
      checkInDate: new Date(body.checkInDate),
      checkOutDate: new Date(body.checkOutDate),
      adults: body.adults,
      children: body.children,
      totalPrice: body.totalPrice,
      specialRequests: body.specialRequests,
      notes: body.notes,
    },
    include: {
      guest: { select: { id: true, firstName: true, lastName: true } },
      roomType: { select: { id: true, name: true } },
      room: { select: { id: true, number: true } },
    },
  });

  res.status(201).json({ success: true, data: booking });
});

// PATCH /api/admin/bookings/:id/status
exports.updateBookingStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status: nextStatus } = z
    .object({ status: z.enum(['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']) })
    .parse(req.body);

  const booking = await prisma.booking.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!booking) throw new ApiError(404, 'Booking not found');

  const allowed = BOOKING_TRANSITIONS[booking.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(400, `Cannot move booking from ${booking.status} to ${nextStatus}`);
  }

  const updateData = { status: nextStatus };
  if (timestampField[nextStatus]) {
    updateData[timestampField[nextStatus]] = new Date();
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      guest: { select: { id: true, firstName: true, lastName: true } },
      roomType: { select: { id: true, name: true } },
      room: { select: { id: true, number: true } },
    },
  });

  logAudit({
    hotelId: req.staff.hotelId,
    staffId: req.staff.id,
    action: `booking.${booking.status.toLowerCase()}_to_${nextStatus.toLowerCase()}`,
    resource: 'Booking',
    resourceId: id,
    details: {
      guest: `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`.trim(),
      from: booking.status,
      to: nextStatus,
    },
  });

  // Emit real-time event
  emitBookingUpdated(updated);

  res.json({ success: true, data: updated });
});

// PATCH /api/admin/bookings/:id
exports.updateBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const body = updateBookingSchema.parse(req.body);

  const booking = await prisma.booking.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (body.roomId && body.roomId !== booking.roomId) {
    const checkIn = body.checkInDate || booking.checkInDate;
    const checkOut = body.checkOutDate || booking.checkOutDate;

    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId: body.roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        id: { not: id },
        AND: [
          { checkInDate: { lt: checkOut } },
          { checkOutDate: { gt: checkIn } },
        ],
      },
    });
    if (overlapping) {
      throw new ApiError(409, 'Room is not available for the selected dates');
    }
  }

  const data = { ...body };
  if (data.checkInDate) data.checkInDate = new Date(data.checkInDate);
  if (data.checkOutDate) data.checkOutDate = new Date(data.checkOutDate);

  const updated = await prisma.booking.update({
    where: { id },
    data,
    include: {
      guest: { select: { id: true, firstName: true, lastName: true } },
      roomType: { select: { id: true, name: true } },
      room: { select: { id: true, number: true } },
    },
  });

  res.json({ success: true, data: updated });
});
