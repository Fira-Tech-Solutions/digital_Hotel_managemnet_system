const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signToken = (staff) =>
  jwt.sign({ staffId: staff.id, role: staff.role, hotelId: staff.hotelId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  });

// POST /api/admin/auth/login
exports.login = catchAsync(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff || !staff.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, staff.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(staff);

  res.json({
    success: true,
    data: {
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        hotelId: staff.hotelId,
      },
    },
  });
});

// GET /api/admin/auth/me
exports.me = catchAsync(async (req, res) => {
  const { id, name, email, role, hotelId } = req.staff;
  res.json({ success: true, data: { id, name, email, role, hotelId } });
});

// POST /api/admin/auth/staff  (invite/create staff — OWNER/MANAGER only)
const createStaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['OWNER', 'MANAGER', 'KITCHEN', 'WAITER']),
});

exports.createStaff = catchAsync(async (req, res) => {
  const data = createStaffSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(data.password, 10);

  const staff = await prisma.staff.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      passwordHash,
      hotelId: req.staff.hotelId,
    },
  });

  res.status(201).json({
    success: true,
    data: { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
  });
});

// GET /api/admin/auth/staff
exports.listStaff = catchAsync(async (req, res) => {
  const staff = await prisma.staff.findMany({
    where: { hotelId: req.staff.hotelId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ success: true, data: staff });
});

// PATCH /api/admin/auth/staff/:id
exports.updateStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, role, isActive } = req.body;

  const staff = await prisma.staff.update({
    where: { id, hotelId: req.staff.hotelId },
    data: { name, role, isActive },
  });

  res.json({ success: true, data: { id: staff.id, name: staff.name, role: staff.role, isActive: staff.isActive } });
});
