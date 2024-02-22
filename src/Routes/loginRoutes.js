const express = require('express');
const UserController = require('../Controller/loginController');

const router = express.Router();

router.post('/forgot-password', UserController.forgotPassword);

module.exports = router;