const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

router.get('/umkm', adminController.getUmkms);
const { uploadUmkm } = require('../middleware/upload');
router.patch('/umkm/:id', uploadUmkm.single('photo'), adminController.editUmkm);
router.delete('/umkm/:id', adminController.deleteUmkm);

router.get('/stalls', adminController.getStalls);
router.delete('/stalls/:id', adminController.deleteStall);

router.get('/applications/umkm', adminController.getUmkmApps);
router.get('/applications/umkm/:id', adminController.getUmkmAppById);
router.patch('/applications/umkm/:id/review', adminController.reviewUmkmApp);

router.get('/applications/stall', adminController.getStallApps);
router.get('/applications/stall/:id', adminController.getStallAppById);
router.patch('/applications/stall/:id/review', adminController.reviewStallApp);

router.delete('/ratings/:id', adminController.deleteRating);
router.get('/metrics', adminController.getMetrics);

module.exports = router;
