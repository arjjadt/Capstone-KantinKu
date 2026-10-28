const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, orderController.checkout);
router.get('/', authenticate, orderController.getMyOrders);
router.get('/splits/:splitId', authenticate, orderController.getOrderSplitById);
router.get('/:id', authenticate, orderController.getOrderById);

module.exports = router;
