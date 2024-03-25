const express = require('express');
const router = express.Router();
const tipController = require('../Controller/tipController');
const NotiController = require('../Controller/notificationController');


router.post('/tips/Month', tipController.CompareByMonth);
router.post('/tips/week', tipController.CompareByWeek);
router.post('/tips',NotiController.addTips)
router.get('/tips',tipController.getTipByUserId);
router.put('/tips',tipController.updateStatusRead);
router.get('/tips/All',tipController.getAllTips)
module.exports = router;