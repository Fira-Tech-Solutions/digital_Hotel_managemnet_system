const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { emitNewOrder, emitOrderUpdate } = require('../sockets');
const { logAudit } = require('../utils/audit');

// Full include shape reused across responses so guest + kitchen always see
// consistent, complete order data.
const orderInclude = {
  table: true,
  items: {
    include: {
      customizations: true,
    },
  },
};

// ==========================================================
// GUEST — submit an order
// ==========================================================

const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1),
  itemNotes: z.string().optional(),
  optionIds: z.array(z.string().uuid()).default([]), // selected customization option ids
});

const createOrderSchema = z.object({
  tableId: z.string().uuid(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

// POST /api/public/orders
exports.createOrder = catchAsync(async (req, res) => {
  const data = createOrderSchema.parse(req.body);

  const table = await prisma.table.findUnique({ where: { id: data.tableId } });
  if (!table || !table.isActive) throw new ApiError(404, 'Invalid table');

  // Fetch all referenced menu items + options in one go, validate & price server-side.
  // NEVER trust client-submitted prices — always recompute from the DB.
  const menuItemIds = [...new Set(data.items.map((i) => i.menuItemId))];
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    include: { customizationGroups: { include: { options: true } } },
  });
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  let subtotal = 0;
  const orderItemsData = [];

  for (const line of data.items) {
    const menuItem = menuItemMap.get(line.menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      throw new ApiError(400, `"${menuItem?.name || 'An item'}" is no longer available`);
    }

    const allOptions = menuItem.customizationGroups.flatMap((g) => g.options);
    const selectedOptions = allOptions.filter((o) => line.optionIds.includes(o.id));

    const optionsTotal = selectedOptions.reduce((sum, o) => sum + Number(o.priceDelta), 0);
    const lineTotal = (Number(menuItem.price) + optionsTotal) * line.quantity;
    subtotal += lineTotal;

    orderItemsData.push({
      menuItemId: menuItem.id,
      nameSnapshot: menuItem.name,
      priceSnapshot: menuItem.price,
      quantity: line.quantity,
      itemNotes: line.itemNotes,
      customizations: {
        create: selectedOptions.map((o) => ({
          optionId: o.id,
          labelSnapshot: o.label,
          priceDeltaSnapshot: o.priceDelta,
        })),
      },
    });
  }

  const guestSessionId = uuidv4();

  const order = await prisma.order.create({
    data: {
      hotelId: table.hotelId,
      tableId: table.id,
      notes: data.notes,
      subtotal,
      total: subtotal, // add service charge/tax calc here if needed
      guestSessionId,
      items: { create: orderItemsData },
    },
    include: orderInclude,
  });

  emitNewOrder(order);

  res.status(201).json({ success: true, data: order });
});

// GET /api/public/orders/:id?guestSessionId=  -> guest polls/loads their order status
exports.getPublicOrder = catchAsync(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: orderInclude,
  });

  if (!order) throw new ApiError(404, 'Order not found');

  // Lightweight ownership check — guest must present the session id they were issued.
  if (req.query.guestSessionId && order.guestSessionId !== req.query.guestSessionId) {
    throw new ApiError(403, 'This order does not belong to your session');
  }

  res.json({ success: true, data: order });
});

// ==========================================================
// ADMIN — live queue + status transitions
// ==========================================================

// GET /api/admin/orders?status=PENDING,ACCEPTED
exports.listOrders = catchAsync(async (req, res) => {
  const { status } = req.query;
  const statuses = status ? String(status).split(',') : undefined;

  const orders = await prisma.order.findMany({
    where: {
      hotelId: req.staff.hotelId,
      ...(statuses ? { status: { in: statuses } } : {}),
    },
    orderBy: { createdAt: 'asc' },
    include: orderInclude,
  });

  res.json({ success: true, data: orders });
});

// GET /api/admin/orders/:id
exports.getOrder = catchAsync(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, hotelId: req.staff.hotelId },
    include: orderInclude,
  });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: order });
});

// Valid forward transitions in the kitchen workflow.
const ALLOWED_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['READY', 'CANCELLED'],
  READY: ['SERVED'],
  SERVED: [],
  CANCELLED: [],
};

const timestampField = {
  ACCEPTED: 'acceptedAt',
  READY: 'readyAt',
  SERVED: 'servedAt',
  CANCELLED: 'cancelledAt',
};

// PATCH /api/admin/orders/:id/status  { status: "ACCEPTED" | "READY" | "SERVED" | "CANCELLED" }
// This is the endpoint the chef hits: "Accept" moves PENDING -> ACCEPTED,
// which is what triggers the guest's success/verification screen in real time.
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status: nextStatus } = z
    .object({ status: z.enum(['ACCEPTED', 'READY', 'SERVED', 'CANCELLED']) })
    .parse(req.body);

  const order = await prisma.order.findFirst({
    where: { id: req.params.id, hotelId: req.staff.hotelId },
  });
  if (!order) throw new ApiError(404, 'Order not found');

  const allowed = ALLOWED_TRANSITIONS[order.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(400, `Cannot move an order from ${order.status} to ${nextStatus}`);
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
      [timestampField[nextStatus]]: new Date(),
      ...(nextStatus === 'ACCEPTED' ? { acceptedById: req.staff.id } : {}),
    },
    include: orderInclude,
  });

  // Pushes live updates to both the kitchen board and the guest's tracking screen.
  emitOrderUpdate(updated);

  logAudit({
    hotelId: req.staff.hotelId,
    staffId: req.staff.id,
    action: `order.${order.status.toLowerCase()}_to_${nextStatus.toLowerCase()}`,
    resource: 'Order',
    resourceId: order.id,
    details: { orderNumber: order.orderNumber, from: order.status, to: nextStatus },
  });

  res.json({ success: true, data: updated });
});

// GET /api/admin/orders/stats/today  -> quick dashboard numbers
exports.getTodayStats = catchAsync(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { hotelId: req.staff.hotelId, createdAt: { gte: startOfDay } },
    select: { status: true, total: true },
  });

  const totalOrders = orders.length;
  const revenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.total), 0);
  const activeOrders = orders.filter((o) => ['PENDING', 'ACCEPTED', 'READY'].includes(o.status)).length;

  res.json({ success: true, data: { totalOrders, revenue, activeOrders } });
});
