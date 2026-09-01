const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const hotelController = require('../controllers/hotelController');
const menuController = require('../controllers/menuController');
const tableController = require('../controllers/tableController');
const orderController = require('../controllers/orderController');
const uploadController = require('../controllers/uploadController');
const departmentController = require('../controllers/departmentController');
const stationController = require('../controllers/stationController');
const guestController = require('../controllers/guestController');
const bookingController = require('../controllers/bookingController');
const roomController = require('../controllers/roomController');
const serviceRequestController = require('../controllers/serviceRequestController');
const auditController = require('../controllers/auditController');
const reportController = require('../controllers/reportController');
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

// ---------- Roles & Permissions ----------
router.get('/auth/roles', requireRole('OWNER', 'MANAGER'), authController.listRoles);
router.get('/auth/roles/:id', requireRole('OWNER', 'MANAGER'), authController.getRole);
router.post('/auth/roles', requireRole('OWNER'), authController.createRole);
router.patch('/auth/roles/:id/permissions', requireRole('OWNER'), authController.updateRolePermissions);
router.get('/auth/permissions', requireRole('OWNER', 'MANAGER'), authController.getPermissions);

// ---------- Departments ----------
router.get('/departments', departmentController.listDepartments);
router.post('/departments', requireRole('OWNER', 'MANAGER'), departmentController.createDepartment);
router.patch('/departments/:id', requireRole('OWNER', 'MANAGER'), departmentController.updateDepartment);
router.delete('/departments/:id', requireRole('OWNER', 'MANAGER'), departmentController.deleteDepartment);

// ---------- Stations ----------
router.get('/stations', stationController.listStations);
router.get('/stations/:id', stationController.getStation);
router.post('/stations', requireRole('OWNER', 'MANAGER'), stationController.createStation);
router.patch('/stations/:id', requireRole('OWNER', 'MANAGER'), stationController.updateStation);
router.delete('/stations/:id', requireRole('OWNER', 'MANAGER'), stationController.deleteStation);
router.patch('/stations/:id/status', stationController.updateStationStatus);

// ---------- Guests ----------
router.get('/guests', guestController.listGuests);
router.get('/guests/:id', guestController.getGuest);
router.post('/guests', guestController.createGuest);
router.patch('/guests/:id', guestController.updateGuest);

// ---------- Rooms ----------
router.get('/rooms', roomController.listRooms);
router.get('/rooms/types', roomController.listRoomTypes);
router.post('/rooms', requireRole('OWNER', 'MANAGER'), roomController.createRoom);
router.patch('/rooms/:id', requireRole('OWNER', 'MANAGER'), roomController.updateRoom);
router.patch('/rooms/:id/status', roomController.updateRoomStatus);
router.post('/rooms/types', requireRole('OWNER', 'MANAGER'), roomController.createRoomType);
router.patch('/rooms/types/:id', requireRole('OWNER', 'MANAGER'), roomController.updateRoomType);

// ---------- Bookings ----------
router.get('/bookings', bookingController.listBookings);
router.get('/bookings/:id', bookingController.getBooking);
router.post('/bookings', bookingController.createBooking);
router.patch('/bookings/:id', bookingController.updateBooking);
router.patch('/bookings/:id/status', bookingController.updateBookingStatus);

// ---------- Service Requests ----------
router.get('/service-requests', serviceRequestController.listServiceRequests);
router.get('/service-requests/:id', serviceRequestController.getServiceRequest);
router.post('/service-requests', serviceRequestController.createServiceRequest);
router.patch('/service-requests/:id/status', serviceRequestController.updateServiceRequestStatus);
router.patch('/service-requests/:id/assign', serviceRequestController.assignServiceRequest);

// ---------- Audit Logs ----------
router.get('/audit-logs', auditController.listAuditLogs);

// ---------- Reports ----------
router.get('/reports/dashboard', reportController.getDashboardStats);
router.get('/reports/occupancy', reportController.getOccupancyReport);
router.get('/reports/orders', reportController.getOrderStats);

module.exports = router;
