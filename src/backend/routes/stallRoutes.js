const express = require('express');
const router = express.Router();
const stallController = require('../controllers/stallController');
const menuController = require('../controllers/menuController');
const ratingController = require('../controllers/ratingController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Stall photo upload config
const stallStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'stalls'));
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const uploadStall = multer({
  storage: stallStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Not an image!'), false);
  },
  limits: { fileSize: 20 * 1024 * 1024 }
});

// Public routes
router.get('/umkm/:umkmId', stallController.getStallsByUmkm);
router.get('/:id', stallController.getStallById);
router.get('/:stallId/menu', menuController.getMenuByStall);
router.get('/:stallId/ratings', ratingController.getStallRatings);

// Seller routes (mounted at /api/seller/stall in server.js)
router.get('/my/profile', authenticate, authorize('seller'), stallController.getMyStall);
router.patch('/my/profile', authenticate, authorize('seller'), uploadStall.single('photo'), stallController.updateMyStall);
router.patch('/my/status', authenticate, authorize('seller'), stallController.toggleStatus);

module.exports = router;
