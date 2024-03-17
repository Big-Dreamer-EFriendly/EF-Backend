const express = require('express');
const router = express.Router();
const statisticController = require('../Controller/timeUseDeviceController');


router.get('/statistic/lastMonth/:roomId', statisticController.getTotalUsageTimeByMonth);
router.get('/statistics',statisticController.getTotalElectricity);
router.get('/statistics/lastYear',statisticController.getTotalElectricityByPerMonth);
router.get('/statistics/lastWeek',statisticController.getTotalElectricityByLast7Days);








module.exports = router;