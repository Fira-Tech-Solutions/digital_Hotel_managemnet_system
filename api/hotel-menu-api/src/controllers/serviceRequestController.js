const { z } = require('zod');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createServiceRequestSchema = z.object({
  guestId: z.string().uuid().optional().nullable(),
  bookingId: z.string().uuid().optional().nullable(),
  locationId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  stationId: z.string().uuid().optional().nullable(),
  serviceType: z.enum([
    'CALL_WAITER', 'HOUSEKEEPING', 'MAINTENANCE', 'LAUNDRY',
    'ROOM_SERVICE', 'CONCIERGE', 'SPA', 'TRANSPORT', 'OTHER',
  ]),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  notes: z.string().optional(),
  guestSessionId: z.string().optional(),
});

const SR_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'ASSIGNED', 'CANCELLED'],
  ACCEPTED: ['ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

// GET /api/admin/service-requests?status=&departmentId=&serviceType=
exports.listServiceRequests = catchAsync(async (req, res) => {
  const { status, departmentId, serviceType } = req.query;

  const where = { hotelId: req.staff.hotelId };
  if (status) {
    const statuses = String(status).split(',');
    where.status = { in: statuses };
  }
  if (departmentId) where.departmentId = departmentId;
  if (serviceType) where.serviceType = serviceType;

  const requests = await prisma.serviceRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      guest: { select: { id: true, firstName: true, lastName: true } },
      department: { select: { id: true, name: true } },
      assignedStaff: { select: { id: true, name: true } },
      location: { select: { id: true, name: true, type: true } },
    },
  });

  res.json({ success: true, data: requests });
});

// GET /api/admin/service-requests/:id
exports.getServiceRequest = catchAsync(async (req, res) => {
  const request = await prisma.serviceRequest.findFirst({
    where: { id: req.params.id, hotelId: req.staff.hotelId },
    include: {
      guest: true,
      department: true,
      station: true,
      assignedStaff: { select: { id: true, name: true, email: true } },
      completedBy: { select: { id: true, name: true } },
      location: true,
      booking: { select: { id: true, confirmationCode: true, room: { select: { number: true } } } },
    },
  });

  if (!request) throw new ApiError(404, 'Service request not found');
  res.json({ success: true, data: request });
});

// POST /api/admin/service-requests
exports.createServiceRequest = catchAsync(async (req, res) => {
  const body = createServiceRequestSchema.parse(req.body);

  const request = await prisma.serviceRequest.create({
    data: {
      hotelId: req.staff.hotelId,
      guestId: body.guestId,
      bookingId: body.bookingId,
      locationId: body.locationId,
      departmentId: body.departmentId,
      stationId: body.stationId,
      serviceType: body.serviceType,
      description: body.description,
      priority: body.priority,
      notes: body.notes,
      guestSessionId: body.guestSessionId,
    },
    include: {
      guest: { select: { id: true, firstName: true, lastName: true } },
      department: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({ success: true, data: request });
});

// PATCH /api/admin/service-requests/:id/status
exports.updateServiceRequestStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status: nextStatus } = z
    .object({ status: z.enum(['ACCEPTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED']) })
    .parse(req.body);

  const request = await prisma.serviceRequest.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!request) throw new ApiError(404, 'Service request not found');

  const allowed = SR_TRANSITIONS[request.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(400, `Cannot move service request from ${request.status} to ${nextStatus}`);
  }

  const updateData = { status: nextStatus };
  if (nextStatus === 'ACCEPTED') updateData.acceptedAt = new Date();
  if (nextStatus === 'IN_PROGRESS') updateData.startedAt = new Date();
  if (nextStatus === 'COMPLETED') {
    updateData.completedAt = new Date();
    updateData.completedById = req.staff.id;
  }
  if (nextStatus === 'CANCELLED') updateData.cancelledAt = new Date();

  const updated = await prisma.serviceRequest.update({
    where: { id },
    data: updateData,
    include: {
      guest: { select: { id: true, firstName: true, lastName: true } },
      department: { select: { id: true, name: true } },
      assignedStaff: { select: { id: true, name: true } },
    },
  });

  res.json({ success: true, data: updated });
});

// PATCH /api/admin/service-requests/:id/assign
exports.assignServiceRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { staffId } = z.object({ staffId: z.string().uuid() }).parse(req.body);

  const request = await prisma.serviceRequest.findFirst({
    where: { id, hotelId: req.staff.hotelId },
  });
  if (!request) throw new ApiError(404, 'Service request not found');

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, hotelId: req.staff.hotelId },
  });
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const updated = await prisma.serviceRequest.update({
    where: { id },
    data: {
      assignedStaffId: staffId,
      status: request.status === 'PENDING' || request.status === 'ACCEPTED' ? 'ASSIGNED' : undefined,
    },
    include: {
      assignedStaff: { select: { id: true, name: true } },
    },
  });

  res.json({ success: true, data: updated });
});
