const express = require('express');
const router = express.Router();
const statisticController = require('../Controller/timeUseDeviceController');


router.get('/statistic/deviceInRoom', statisticController.getTotalUsageTimeByMonth);
router.get('/statistics',statisticController.getTotalElectricity);
router.get('/statistics/AllMonth',statisticController.getTotalElectricityByPerMonth);
router.get('/statistics/7days',statisticController.getTotalElectricityByLast7Days);








module.exports = router;