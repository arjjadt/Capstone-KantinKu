const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { uploadAvatar } = require('../middleware/upload');
const authController = require('../controllers/authController');

router.post('/register', [
  body('username').notEmpty().matches(/^\S+$/).withMessage('Username cannot contain spaces'),
  body('full_name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validate
], authController.register);

router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty(),
  validate
], authController.login);

router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);

router.patch('/me', authenticate, uploadAvatar.single('avatar'), authController.updateMe);

router.patch('/me/password', [
  authenticate,
  body('old_password').notEmpty(),
  body('new_password').isLength({ min: 6 }),
  validate
], authController.updatePassword);

module.exports = router;
