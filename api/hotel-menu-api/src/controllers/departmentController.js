const { z } = require('zod');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createDepartmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).toUpperCase(),
  description: z.string().optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).toUpperCase().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/departments
exports.listDepartments = catchAsync(async (req, res) => {
  const departments = await prisma.department.findMany({
    where: { hotelId: req.staff.hotelId },
    include: {
      _count: { select: { serviceStations: { where: { isActive: true } } } },
    },
    orderBy: { name: 'asc' },
  });

  const data = departments.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    description: d.description,
    isActive: d.isActive,
    stationCount: d._count.serviceStations,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  res.json({ success: true, data });
});

// POST /api/admin/departments
exports.createDepartment = catchAsync(async (req, res) => {
  const body = createDepartmentSchema.parse(req.body);

  const existing = await prisma.department.findFirst({
    where: { hotelId: req.staff.hotelId, code: body.code },
  });
  if (existing) {
    throw new ApiError(409, 'A department with this code already exists');
  }

  const department = await prisma.department.create({
    data: {
      hotelId: req.staff.hotelId,
      name: body.name,
      code: body.code,
      description: body.description,
    },
  });

  res.status(201).json({ success: true, data: department });
});

// PATCH /api/admin/departments/:id
exports.updateDepartment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const body = updateDepartmentSchema.parse(req.body);

  const department = await prisma.department.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!department) throw new ApiError(404, 'Department not found');

  if (body.code && body.code !== department.code) {
    const dup = await prisma.department.findFirst({
      where: { hotelId: req.staff.hotelId, code: body.code, id: { not: id } },
    });
    if (dup) throw new ApiError(409, 'A department with this code already exists');
  }

  const updated = await prisma.department.update({
    where: { id },
    data: body,
  });

  res.json({ success: true, data: updated });
});

// DELETE /api/admin/departments/:id
exports.deleteDepartment = catchAsync(async (req, res) => {
  const { id } = req.params;

  const department = await prisma.department.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!department) throw new ApiError(404, 'Department not found');

  const activeStations = await prisma.serviceStation.count({
    where: { departmentId: id, isActive: true },
  });
  if (activeStations > 0) {
    throw new ApiError(400, 'Cannot delete department with active service stations');
  }

  const updated = await prisma.department.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({ success: true, data: updated });
});
