const express = require('express');
const router = express.Router();
const appController = require('../controllers/applicationController');
const authenticate = require('../middleware/authenticate');
const { uploadUmkm } = require('../middleware/upload');

router.use(authenticate);

router.post('/umkm', uploadUmkm.single('document'), appController.applyUmkm);
router.get('/umkm/my', appController.getMyUmkmApplications);

router.post('/stall', appController.applyStall);
router.get('/stall/my', appController.getMyStallApplications);

module.exports = router;
