const express = require('express');
const router = express.Router();
const statisticController = require('../Controller/timeUseDeviceController');


router.get('/statistics/lastMonth/:roomId', statisticController.getTotalUsageTimeByMonth);
router.get('/statistics',statisticController.getTotalCostOfDevices);
router.get('/statistics/lastYear',statisticController.getTotalElectricityByPerMonth);
router.get('/statistics/lastWeek',statisticController.getTotalElectricityByLast7Days);
router.get('/statistics/lastMonth',statisticController.getTotalElectricityBy30days);








module.exports = router;