const { z } = require('zod');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// ==========================================================
// PUBLIC (guest menu app)
// ==========================================================

// GET /api/public/menu
// Returns the full menu tree: categories -> items -> customization groups/options
// Only active categories/items are returned, ordered by sortOrder.
exports.getPublicMenu = catchAsync(async (req, res) => {
  const hotel = await prisma.hotel.findFirst({ select: { id: true } });
  if (!hotel) throw new ApiError(404, 'Hotel not configured yet');

  const categories = await prisma.category.findMany({
    where: { hotelId: hotel.id, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          customizationGroups: {
            include: { options: true },
          },
        },
      },
    },
  });

  res.json({ success: true, data: categories });
});

// ==========================================================
// ADMIN — Categories
// ==========================================================

const categorySchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/menu/categories
exports.listCategories = catchAsync(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { hotelId: req.staff.hotelId },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { items: true } } },
  });
  res.json({ success: true, data: categories });
});

// POST /api/admin/menu/categories
exports.createCategory = catchAsync(async (req, res) => {
  const data = categorySchema.parse(req.body);
  const category = await prisma.category.create({
    data: { ...data, hotelId: req.staff.hotelId },
  });
  res.status(201).json({ success: true, data: category });
});

// PATCH /api/admin/menu/categories/:id
exports.updateCategory = catchAsync(async (req, res) => {
  const data = categorySchema.partial().parse(req.body);
  const category = await prisma.category.update({
    where: { id: req.params.id, hotelId: req.staff.hotelId },
    data,
  });
  res.json({ success: true, data: category });
});

// DELETE /api/admin/menu/categories/:id
exports.deleteCategory = catchAsync(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id, hotelId: req.staff.hotelId } });
  res.json({ success: true, message: 'Category deleted' });
});

// ==========================================================
// ADMIN — Menu items
// ==========================================================

const customizationOptionSchema = z.object({
  label: z.string().min(1),
  priceDelta: z.number().default(0),
});

const customizationGroupSchema = z.object({
  name: z.string().min(1),
  isRequired: z.boolean().default(false),
  allowMultiple: z.boolean().default(false),
  options: z.array(customizationOptionSchema).default([]),
});

const itemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  isChefSpecial: z.boolean().optional(),
  prepTimeMins: z.number().int().nonnegative().optional(),
  dietaryTags: z
    .array(z.enum(['VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'SPICY', 'NUT_FREE', 'HALAL']))
    .optional(),
  sortOrder: z.number().int().optional(),
  customizationGroups: z.array(customizationGroupSchema).optional(),
});

// GET /api/admin/menu/items?categoryId=
exports.listItems = catchAsync(async (req, res) => {
  const { categoryId } = req.query;
  const items = await prisma.menuItem.findMany({
    where: {
      category: { hotelId: req.staff.hotelId },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { sortOrder: 'asc' },
    include: { customizationGroups: { include: { options: true } } },
  });
  res.json({ success: true, data: items });
});

// POST /api/admin/menu/items
exports.createItem = catchAsync(async (req, res) => {
  const data = itemSchema.parse(req.body);
  const { customizationGroups, ...itemData } = data;

  // Ensure the category belongs to this hotel
  const category = await prisma.category.findFirst({
    where: { id: itemData.categoryId, hotelId: req.staff.hotelId },
  });
  if (!category) throw new ApiError(404, 'Category not found');

  const item = await prisma.menuItem.create({
    data: {
      ...itemData,
      customizationGroups: customizationGroups
        ? {
            create: customizationGroups.map((g) => ({
              name: g.name,
              isRequired: g.isRequired,
              allowMultiple: g.allowMultiple,
              options: { create: g.options },
            })),
          }
        : undefined,
    },
    include: { customizationGroups: { include: { options: true } } },
  });

  res.status(201).json({ success: true, data: item });
});

// PATCH /api/admin/menu/items/:id
exports.updateItem = catchAsync(async (req, res) => {
  const data = itemSchema.partial().parse(req.body);
  const { customizationGroups, ...itemData } = data;

  const existing = await prisma.menuItem.findFirst({
    where: { id: req.params.id, category: { hotelId: req.staff.hotelId } },
  });
  if (!existing) throw new ApiError(404, 'Menu item not found');

  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: itemData,
    include: { customizationGroups: { include: { options: true } } },
  });

  res.json({ success: true, data: item });
});

// PATCH /api/admin/menu/items/:id/availability  { isAvailable: boolean }
// Fast "sold out" toggle used heavily during service.
exports.setAvailability = catchAsync(async (req, res) => {
  const { isAvailable } = z.object({ isAvailable: z.boolean() }).parse(req.body);

  const existing = await prisma.menuItem.findFirst({
    where: { id: req.params.id, category: { hotelId: req.staff.hotelId } },
  });
  if (!existing) throw new ApiError(404, 'Menu item not found');

  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: { isAvailable },
  });

  res.json({ success: true, data: item });
});

// DELETE /api/admin/menu/items/:id
exports.deleteItem = catchAsync(async (req, res) => {
  const existing = await prisma.menuItem.findFirst({
    where: { id: req.params.id, category: { hotelId: req.staff.hotelId } },
  });
  if (!existing) throw new ApiError(404, 'Menu item not found');

  await prisma.menuItem.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Menu item deleted' });
});
