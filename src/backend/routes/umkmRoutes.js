const express = require('express');
const router = express.Router();
const umkmController = require('../controllers/umkmController');

router.get('/', umkmController.getAllUmkm);
router.get('/:id', umkmController.getUmkmById);

module.exports = router;
