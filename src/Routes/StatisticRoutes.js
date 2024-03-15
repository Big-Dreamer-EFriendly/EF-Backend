const express = require('express');
const router = express.Router();
const statisticController = require('../Controller/timeUseDeviceController');


router.get('/statistic/deviceInRoom', statisticController.getTotalUsageTimeByMonth);
router.get('/statistics',statisticController.getTotalElectricity);




module.exports = router;