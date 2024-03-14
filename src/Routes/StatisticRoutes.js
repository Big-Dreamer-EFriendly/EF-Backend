const express = require('express');
const router = express.Router();
const statisticController = require('../Controller/timeUseDeviceController');


router.get('/statistic', statisticController.getTotalUsageTimeByMonth);

module.exports = router;