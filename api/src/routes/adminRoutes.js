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
const { requirePermission, getStaffPermissionSet } = require('../middleware/rbac');

// ---------- Auth (public within /admin, no token needed to log in) ----------
router.post('/auth/login', authController.login);
router.post('/auth/pin-login', authController.pinLogin);

// Everything below this line requires a valid staff token
router.use(requireAuth);

router.get('/auth/me', authController.me);

// Current user's effective permissions (for frontend RBAC rendering)
router.get('/auth/my-permissions', async (req, res, next) => {
  try {
    const perms = await getStaffPermissionSet(req.staff.id);
    res.json({
      success: true,
      data: {
        staffId: req.staff.id,
        name: req.staff.name,
        email: req.staff.email,
        role: req.staff.role,
        hotelId: req.staff.hotelId,
        isElevated: false,
        permissions: perms,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Staff Management ----------
router.get('/auth/staff', requirePermission('users', 'read'), authController.listStaff);
router.post('/auth/staff', requirePermission('users', 'create'), authController.createStaff);
router.patch('/auth/staff/:id', requirePermission('users', 'update'), authController.updateStaff);
router.patch('/auth/staff/:id/pin', requirePermission('users', 'update'), authController.setStaffPin);

// ---------- Hotel profile & theme ----------
router.get('/hotel', hotelController.getAdminHotel);
router.patch('/hotel', requirePermission('settings', 'update'), hotelController.updateHotel);
router.put('/hotel/theme', requirePermission('settings', 'update'), hotelController.updateTheme);

// ---------- Menu: categories ----------
router.get('/menu/categories', menuController.listCategories);
router.post('/menu/categories', requirePermission('menu', 'create'), menuController.createCategory);
router.patch('/menu/categories/:id', requirePermission('menu', 'update'), menuController.updateCategory);
router.delete('/menu/categories/:id', requirePermission('menu', 'delete'), menuController.deleteCategory);

// ---------- Menu: items ----------
router.get('/menu/items', menuController.listItems);
router.post('/menu/items', requirePermission('menu', 'create'), menuController.createItem);
router.patch('/menu/items/:id', requirePermission('menu', 'update'), menuController.updateItem);
router.patch('/menu/items/:id/availability', requirePermission('menu', 'update'), menuController.setAvailability);
router.delete('/menu/items/:id', requirePermission('menu', 'delete'), menuController.deleteItem);

// ---------- Tables / QR codes ----------
router.get('/tables', tableController.listTables);
router.post('/tables', requirePermission('rooms', 'create'), tableController.createTable);
router.get('/tables/:id/qrcode', tableController.getTableQr);
router.post('/tables/:id/regenerate', requirePermission('rooms', 'update'), tableController.regenerateTableQr);
router.delete('/tables/:id', requirePermission('rooms', 'delete'), tableController.deleteTable);

// ---------- Orders (kitchen queue) ----------
router.get('/orders', requirePermission('orders', 'read'), orderController.listOrders);
router.get('/orders/stats/today', requirePermission('orders', 'read'), orderController.getTodayStats);
router.get('/orders/:id', requirePermission('orders', 'read'), orderController.getOrder);
router.patch('/orders/:id/status', requirePermission('orders', 'update'), orderController.updateOrderStatus);

// ---------- Uploads (images) ----------
router.post('/uploads', upload.single('file'), uploadController.uploadFile);

// ---------- Roles & Permissions ----------
router.get('/auth/roles', requirePermission('roles', 'read'), authController.listRoles);
router.get('/auth/roles/:id', requirePermission('roles', 'read'), authController.getRole);
router.post('/auth/roles', requirePermission('roles', 'create'), authController.createRole);
router.patch('/auth/roles/:id/permissions', requirePermission('roles', 'update'), authController.updateRolePermissions);
router.get('/auth/permissions', requirePermission('roles', 'read'), authController.getPermissions);

// ---------- Departments ----------
router.get('/departments', requirePermission('departments', 'read'), departmentController.listDepartments);
router.post('/departments', requirePermission('departments', 'create'), departmentController.createDepartment);
router.patch('/departments/:id', requirePermission('departments', 'update'), departmentController.updateDepartment);
router.delete('/departments/:id', requirePermission('departments', 'delete'), departmentController.deleteDepartment);

// ---------- Stations ----------
router.get('/stations', requirePermission('stations', 'read'), stationController.listStations);
router.get('/stations/:id', requirePermission('stations', 'read'), stationController.getStation);
router.post('/stations', requirePermission('stations', 'create'), stationController.createStation);
router.patch('/stations/:id', requirePermission('stations', 'update'), stationController.updateStation);
router.delete('/stations/:id', requirePermission('stations', 'delete'), stationController.deleteStation);
router.patch('/stations/:id/status', requirePermission('stations', 'update'), stationController.updateStationStatus);

// ---------- Guests ----------
router.get('/guests', requirePermission('guests', 'read'), guestController.listGuests);
router.get('/guests/:id', requirePermission('guests', 'read'), guestController.getGuest);
router.post('/guests', requirePermission('guests', 'create'), guestController.createGuest);
router.patch('/guests/:id', requirePermission('guests', 'update'), guestController.updateGuest);

// ---------- Rooms ----------
router.get('/rooms', requirePermission('rooms', 'read'), roomController.listRooms);
router.get('/rooms/types', requirePermission('rooms', 'read'), roomController.listRoomTypes);
router.post('/rooms', requirePermission('rooms', 'create'), roomController.createRoom);
router.patch('/rooms/:id', requirePermission('rooms', 'update'), roomController.updateRoom);
router.patch('/rooms/:id/status', requirePermission('rooms', 'update'), roomController.updateRoomStatus);
router.post('/rooms/types', requirePermission('rooms', 'create'), roomController.createRoomType);
router.patch('/rooms/types/:id', requirePermission('rooms', 'update'), roomController.updateRoomType);

// ---------- Bookings ----------
router.get('/bookings', requirePermission('bookings', 'read'), bookingController.listBookings);
router.get('/bookings/:id', requirePermission('bookings', 'read'), bookingController.getBooking);
router.post('/bookings', requirePermission('bookings', 'create'), bookingController.createBooking);
router.patch('/bookings/:id', requirePermission('bookings', 'update'), bookingController.updateBooking);
router.patch('/bookings/:id/status', requirePermission('bookings', 'update'), bookingController.updateBookingStatus);

// ---------- Service Requests ----------
router.get('/service-requests', requirePermission('service_requests', 'read'), serviceRequestController.listServiceRequests);
router.get('/service-requests/:id', requirePermission('service_requests', 'read'), serviceRequestController.getServiceRequest);
router.post('/service-requests', requirePermission('service_requests', 'create'), serviceRequestController.createServiceRequest);
router.patch('/service-requests/:id/status', requirePermission('service_requests', 'update'), serviceRequestController.updateServiceRequestStatus);
router.patch('/service-requests/:id/assign', requirePermission('service_requests', 'update'), serviceRequestController.assignServiceRequest);

// ---------- Audit Logs ----------
router.get('/audit-logs', requirePermission('audit_logs', 'read'), auditController.listAuditLogs);

// ---------- Reports ----------
router.get('/reports/dashboard', requirePermission('reports', 'read'), reportController.getDashboardStats);
router.get('/reports/occupancy', requirePermission('reports', 'read'), reportController.getOccupancyReport);
router.get('/reports/orders', requirePermission('reports', 'read'), reportController.getOrderStats);

module.exports = router;
