const express = require('express');
const router = express.Router();
const reportController = require('../controllers/sellerReportController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, authorize('seller'), reportController.getReport);

module.exports = router;
