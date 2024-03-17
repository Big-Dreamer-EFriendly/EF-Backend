const express = require('express');
const router = express.Router();
const tipController = require('../Controller/tipController');


router.get('/tips', tipController.getTipsByUserId);








module.exports = router;