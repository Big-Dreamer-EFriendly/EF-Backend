const express = require('express');
const UserController = require('../Controller/loginController');
const authController = require('../Controller/authController');

const router = express.Router();

router.post('/forgot-password', UserController.forgotPassword);
router.post('/change-password', authController.changePassword);

module.exports = router;