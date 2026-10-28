const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, ratingController.addRating);

// Get ratings for a stall (mounted at /api/stalls in server.js eventually)
// router.get('/:stallId/ratings', ratingController.getStallRatings);

module.exports = router;
