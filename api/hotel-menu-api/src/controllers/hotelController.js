const { z } = require('zod');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// GET /api/public/hotel  -> used by the public website + menu app
exports.getPublicHotel = catchAsync(async (req, res) => {
  const hotel = await prisma.hotel.findFirst({
    include: { theme: true },
  });
  if (!hotel) throw new ApiError(404, 'Hotel not configured yet');

  res.json({ success: true, data: hotel });
});

// GET /api/admin/hotel  -> full profile for admin settings page
exports.getAdminHotel = catchAsync(async (req, res) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: req.staff.hotelId },
    include: { theme: true },
  });
  res.json({ success: true, data: hotel });
});

const updateHotelSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  operatingHours: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

// PATCH /api/admin/hotel
exports.updateHotel = catchAsync(async (req, res) => {
  const data = updateHotelSchema.parse(req.body);
  const hotel = await prisma.hotel.update({
    where: { id: req.staff.hotelId },
    data,
  });
  res.json({ success: true, data: hotel });
});

const themeSchema = z.object({
  templateId: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
  cardStyle: z.string().optional(),
  layoutDensity: z.string().optional(),
  enabledComponents: z.array(z.string()).optional(),
});

// PUT /api/admin/hotel/theme
exports.updateTheme = catchAsync(async (req, res) => {
  const data = themeSchema.parse(req.body);

  const theme = await prisma.hotelTheme.upsert({
    where: { hotelId: req.staff.hotelId },
    update: data,
    create: { hotelId: req.staff.hotelId, ...data },
  });

  res.json({ success: true, data: theme });
});
