const express = require('express');
const router = express.Router();

const hotelController = require('../controllers/hotelController');
const menuController = require('../controllers/menuController');
const tableController = require('../controllers/tableController');
const orderController = require('../controllers/orderController');

// Hotel profile + theme (used by public website AND menu app for branding)
router.get('/hotel', hotelController.getPublicHotel);

// Menu (guest menu app)
router.get('/menu', menuController.getPublicMenu);

// Table resolution (right after QR scan)
router.get('/tables/:qrToken', tableController.resolveTableByToken);

// Orders (guest submits + polls status)
router.post('/orders', orderController.createOrder);
router.get('/orders/:id', orderController.getPublicOrder);

module.exports = router;
