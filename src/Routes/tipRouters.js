const express = require('express');
const router = express.Router();
const tipControllers = require('../Controller/tipController');


router.get('/totalbill', tipControllers.getAllDevicesInRoomByUserId);

module.exports = router;