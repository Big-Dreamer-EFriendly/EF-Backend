const express = require('express');
const router = express.Router();
const statisticController = require('../Controller/timeUseDeviceController');


router.get('/statistic/deviceInRoom', statisticController.getTotalUsageTimeByMonth);

module.exports = router;