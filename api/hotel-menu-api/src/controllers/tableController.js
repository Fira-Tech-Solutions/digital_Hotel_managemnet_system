const { z } = require('zod');
const QRCode = require('qrcode');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// The guest menu app is a separate deployment, e.g. https://menu.hotelname.com
// Each table's QR code encodes a deep link straight to that table's menu.
const menuBaseUrl = () => process.env.MENU_APP_BASE_URL || 'https://menu.example.com';

// GET /api/admin/tables
exports.listTables = catchAsync(async (req, res) => {
  const tables = await prisma.table.findMany({
    where: { hotelId: req.staff.hotelId },
    orderBy: { createdAt: 'asc' },
  });

  const withLinks = tables.map((t) => ({
    ...t,
    menuUrl: `${menuBaseUrl()}/t/${t.qrToken}`,
  }));

  res.json({ success: true, data: withLinks });
});

const tableSchema = z.object({ number: z.string().min(1) });

// POST /api/admin/tables
exports.createTable = catchAsync(async (req, res) => {
  const { number } = tableSchema.parse(req.body);
  const table = await prisma.table.create({
    data: { number, hotelId: req.staff.hotelId },
  });
  res.status(201).json({ success: true, data: { ...table, menuUrl: `${menuBaseUrl()}/t/${table.qrToken}` } });
});

// GET /api/admin/tables/:id/qrcode  -> returns a PNG data URL
exports.getTableQr = catchAsync(async (req, res) => {
  const table = await prisma.table.findFirst({
    where: { id: req.params.id, hotelId: req.staff.hotelId },
  });
  if (!table) throw new ApiError(404, 'Table not found');

  const url = `${menuBaseUrl()}/t/${table.qrToken}`;
  const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2 });

  res.json({ success: true, data: { table, menuUrl: url, qrDataUrl: dataUrl } });
});

// POST /api/admin/tables/:id/regenerate  -> invalidates old QR, issues a new token
exports.regenerateTableQr = catchAsync(async (req, res) => {
  const { v4: uuidv4 } = require('uuid');
  const table = await prisma.table.update({
    where: { id: req.params.id, hotelId: req.staff.hotelId },
    data: { qrToken: uuidv4() },
  });
  res.json({ success: true, data: { ...table, menuUrl: `${menuBaseUrl()}/t/${table.qrToken}` } });
});

// DELETE /api/admin/tables/:id
exports.deleteTable = catchAsync(async (req, res) => {
  await prisma.table.delete({ where: { id: req.params.id, hotelId: req.staff.hotelId } });
  res.json({ success: true, message: 'Table removed' });
});

// GET /api/public/tables/:qrToken  -> used right after a guest scans the QR,
// resolves the token to a table number + hotel context for the menu app.
exports.resolveTableByToken = catchAsync(async (req, res) => {
  const table = await prisma.table.findUnique({
    where: { qrToken: req.params.qrToken },
    include: { hotel: { select: { id: true, name: true, slug: true, logoUrl: true } } },
  });

  if (!table || !table.isActive) {
    throw new ApiError(404, 'This table QR code is invalid or no longer active');
  }

  res.json({
    success: true,
    data: { tableId: table.id, tableNumber: table.number, hotel: table.hotel },
  });
});
