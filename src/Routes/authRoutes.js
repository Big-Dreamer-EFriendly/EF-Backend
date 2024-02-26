const express = require('express');
const authController = require('../Controller/authController');
const UserController = require('../Controller/loginController');
const verifyToken = require('../Middleware/authMiddleware.js');


const router = express.Router();




router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/change-password',verifyToken, authController.changePassword);
router.post('/refreshToken', authController.refreshToken);


module.exports = router;