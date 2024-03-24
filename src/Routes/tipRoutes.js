const express = require('express');
const router = express.Router();
const tipController = require('../Controller/tipController');

router.post('/tips/Month', tipController.CompareByMonth);
router.post('/tip/week', tipController.CompareByWeek);
router.post('/tips',tipController.addTips)
router.get('/tips',tipController.getTipByUserId);
router.put('/tips',tipController.updateStatusRead);
module.exports = router;