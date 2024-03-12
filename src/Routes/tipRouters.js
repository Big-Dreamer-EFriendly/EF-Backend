const express = require('express');
const router = express.Router();
const tipControllers = require('../Controller/statisticController');


router.get('/totalbill', tipControllers.getAllDevicesInRoomByUserId);

module.exports = router;