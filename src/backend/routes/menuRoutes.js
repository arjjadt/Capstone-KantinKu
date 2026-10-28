const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { uploadMenu } = require('../middleware/upload');

// Public route (mounted at /api/stalls in server.js)
// router.get('/:stallId/menu', menuController.getMenuByStall);

// Seller routes (mounted at /api/seller/menu in server.js)
router.get('/', authenticate, authorize('seller'), menuController.getMyMenu);
router.post('/', authenticate, authorize('seller'), uploadMenu.single('photo'), menuController.addMenu);
router.patch('/:id', authenticate, authorize('seller'), uploadMenu.single('photo'), menuController.updateMenu);
router.delete('/:id', authenticate, authorize('seller'), menuController.deleteMenu);
router.patch('/:id/availability', authenticate, authorize('seller'), menuController.toggleAvailability);

module.exports = router;
