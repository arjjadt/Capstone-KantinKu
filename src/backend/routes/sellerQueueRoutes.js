const express = require('express');
const router = express.Router();
const queueController = require('../controllers/sellerQueueController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('seller'));

router.get('/', queueController.getActiveQueue);
router.get('/history', queueController.getHistoryQueue);
router.get('/:splitId', queueController.getQueueDetail);
router.patch('/:splitId/status', queueController.updateStatus);
router.post('/:splitId/verify', queueController.verifyCode);

module.exports = router;
