const { z } = require('zod');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  nationality: z.string().optional().nullable(),
  idType: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isVip: z.boolean().optional(),
});

const updateGuestSchema = createGuestSchema.partial();

// GET /api/admin/guests?search=&page=1
exports.listGuests = catchAsync(async (req, res) => {
  const { search } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const take = 20;
  const skip = (page - 1) * take;

  const where = { hotelId: req.staff.hotelId };
  if (search) {
    const q = String(search);
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [guests, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.guest.count({ where }),
  ]);

  res.json({
    success: true,
    data: guests,
    pagination: { page, perPage: take, total, totalPages: Math.ceil(total / take) },
  });
});

// GET /api/admin/guests/:id
exports.getGuest = catchAsync(async (req, res) => {
  const guest = await prisma.guest.findFirst({
    where: { id: req.params.id, hotelId: req.staff.hotelId },
    include: {
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { roomType: true, room: true },
      },
      serviceRequests: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!guest) throw new ApiError(404, 'Guest not found');
  res.json({ success: true, data: guest });
});

// POST /api/admin/guests
exports.createGuest = catchAsync(async (req, res) => {
  const body = createGuestSchema.parse(req.body);

  const guest = await prisma.guest.create({
    data: {
      hotelId: req.staff.hotelId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      nationality: body.nationality,
      idType: body.idType,
      idNumber: body.idNumber,
      address: body.address,
      preferences: body.preferences,
      notes: body.notes,
      isVip: body.isVip,
    },
  });

  res.status(201).json({ success: true, data: guest });
});

// PATCH /api/admin/guests/:id
exports.updateGuest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const body = updateGuestSchema.parse(req.body);

  const guest = await prisma.guest.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!guest) throw new ApiError(404, 'Guest not found');

  const data = { ...body };
  if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);

  const updated = await prisma.guest.update({
    where: { id },
    data,
  });

  res.json({ success: true, data: updated });
});
