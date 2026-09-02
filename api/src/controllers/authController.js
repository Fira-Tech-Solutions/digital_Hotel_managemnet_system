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

const pinLoginSchema = z.object({
  pin: z.string().min(4).max(6),
  hotelId: z.string().uuid(),
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

// POST /api/admin/auth/pin-login  -> station-based PIN authentication
exports.pinLogin = catchAsync(async (req, res) => {
  const { pin, hotelId } = pinLoginSchema.parse(req.body);

  // Find staff by PIN hash within the hotel
  const pinHash = await bcrypt.hash(pin, 10);
  
  // We need to compare since bcrypt hash differs per call — find all active staff in hotel
  // and compare in memory (small N for single hotel)
  const staffList = await prisma.staff.findMany({
    where: { hotelId, isActive: true, pinHash: { not: null } },
  });

  let matchedStaff = null;
  for (const s of staffList) {
    const match = await bcrypt.compare(pin, s.pinHash);
    if (match) {
      matchedStaff = s;
      break;
    }
  }

  if (!matchedStaff) {
    throw new ApiError(401, 'Invalid PIN');
  }

  // Update last login
  await prisma.staff.update({
    where: { id: matchedStaff.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signToken(matchedStaff);

  res.json({
    success: true,
    data: {
      token,
      staff: {
        id: matchedStaff.id,
        name: matchedStaff.name,
        email: matchedStaff.email,
        role: matchedStaff.role,
        hotelId: matchedStaff.hotelId,
      },
    },
  });
});

// GET /api/admin/auth/me
exports.me = catchAsync(async (req, res) => {
  const { id, name, email, role, hotelId } = req.staff;
  res.json({ success: true, data: { id, name, email, role, hotelId } });
});

// PATCH /api/admin/auth/staff/:id/pin  -> set/update station PIN
const setPinSchema = z.object({ pin: z.string().min(4).max(6) });

exports.setStaffPin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { pin } = setPinSchema.parse(req.body);

  const staff = await prisma.staff.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!staff) throw new ApiError(404, 'Staff not found');

  const pinHash = await bcrypt.hash(pin, 10);

  const updated = await prisma.staff.update({
    where: { id },
    data: { pinHash },
    select: { id: true, name: true, email: true, role: true },
  });

  res.json({ success: true, data: updated });
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

// ==========================================================
// Roles & Permissions
// ==========================================================

// GET /api/admin/auth/roles
exports.listRoles = catchAsync(async (req, res) => {
  const roles = await prisma.role.findMany({
    include: {
      _count: { select: { permissions: true } },
    },
    orderBy: { name: 'asc' },
  });

  const data = roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    permissionCount: r._count.permissions,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  res.json({ success: true, data });
});

// GET /api/admin/auth/roles/:id
exports.getRole = catchAsync(async (req, res) => {
  const role = await prisma.role.findUnique({
    where: { id: req.params.id },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  if (!role) throw new ApiError(404, 'Role not found');

  const data = {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissions: role.permissions.map((rp) => ({
      id: rp.permission.id,
      resource: rp.permission.resource,
      action: rp.permission.action,
      description: rp.permission.description,
    })),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };

  res.json({ success: true, data });
});

// POST /api/admin/auth/roles
exports.createRole = catchAsync(async (req, res) => {
  const { name, description } = z
    .object({
      name: z.string().min(1),
      description: z.string().optional(),
    })
    .parse(req.body);

  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) throw new ApiError(409, 'A role with this name already exists');

  const role = await prisma.role.create({
    data: { name, description },
  });

  res.status(201).json({ success: true, data: role });
});

// PATCH /api/admin/auth/roles/:id/permissions
exports.updateRolePermissions = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = z
    .object({ permissionIds: z.array(z.string().uuid()) })
    .parse(req.body);

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new ApiError(404, 'Role not found');

  // Replace all permissions: delete existing, create new
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId: id,
        permissionId,
      })),
    }),
  ]);

  const updated = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  res.json({
    success: true,
    data: {
      id: updated.id,
      name: updated.name,
      permissions: updated.permissions.map((rp) => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    },
  });
});

// GET /api/admin/auth/permissions
exports.getPermissions = catchAsync(async (req, res) => {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
  });

  const grouped = {};
  for (const p of permissions) {
    if (!grouped[p.resource]) grouped[p.resource] = [];
    grouped[p.resource].push({
      id: p.id,
      action: p.action,
      description: p.description,
    });
  }

  res.json({ success: true, data: grouped });
});
