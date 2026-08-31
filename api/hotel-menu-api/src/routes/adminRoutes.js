const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const hotelController = require('../controllers/hotelController');
const menuController = require('../controllers/menuController');
const tableController = require('../controllers/tableController');
const orderController = require('../controllers/orderController');
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { requireAuth, requireRole } = require('../middleware/auth');

// ---------- Auth (public within /admin, no token needed to log in) ----------
router.post('/auth/login', authController.login);

// Everything below this line requires a valid staff token
router.use(requireAuth);

router.get('/auth/me', authController.me);
router.get('/auth/staff', requireRole('OWNER', 'MANAGER'), authController.listStaff);
router.post('/auth/staff', requireRole('OWNER', 'MANAGER'), authController.createStaff);
router.patch('/auth/staff/:id', requireRole('OWNER', 'MANAGER'), authController.updateStaff);

// ---------- Hotel profile & theme ----------
router.get('/hotel', hotelController.getAdminHotel);
router.patch('/hotel', requireRole('OWNER', 'MANAGER'), hotelController.updateHotel);
router.put('/hotel/theme', requireRole('OWNER', 'MANAGER'), hotelController.updateTheme);

// ---------- Menu: categories ----------
router.get('/menu/categories', menuController.listCategories);
router.post('/menu/categories', requireRole('OWNER', 'MANAGER'), menuController.createCategory);
router.patch('/menu/categories/:id', requireRole('OWNER', 'MANAGER'), menuController.updateCategory);
router.delete('/menu/categories/:id', requireRole('OWNER', 'MANAGER'), menuController.deleteCategory);

// ---------- Menu: items ----------
router.get('/menu/items', menuController.listItems);
router.post('/menu/items', requireRole('OWNER', 'MANAGER'), menuController.createItem);
router.patch('/menu/items/:id', requireRole('OWNER', 'MANAGER'), menuController.updateItem);
router.patch('/menu/items/:id/availability', menuController.setAvailability); // any staff can 86 an item
router.delete('/menu/items/:id', requireRole('OWNER', 'MANAGER'), menuController.deleteItem);

// ---------- Tables / QR codes ----------
router.get('/tables', tableController.listTables);
router.post('/tables', requireRole('OWNER', 'MANAGER'), tableController.createTable);
router.get('/tables/:id/qrcode', tableController.getTableQr);
router.post('/tables/:id/regenerate', requireRole('OWNER', 'MANAGER'), tableController.regenerateTableQr);
router.delete('/tables/:id', requireRole('OWNER', 'MANAGER'), tableController.deleteTable);

// ---------- Orders (kitchen queue) ----------
router.get('/orders', orderController.listOrders);
router.get('/orders/stats/today', orderController.getTodayStats);
router.get('/orders/:id', orderController.getOrder);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

// ---------- Uploads (images) ----------
router.post('/uploads', upload.single('file'), uploadController.uploadFile);

module.exports = router;
