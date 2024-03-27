const express = require('express');
const authController = require('../Controller/authController');


const router = express.Router();




router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/refreshToken', authController.refreshToken);


module.exports = router;