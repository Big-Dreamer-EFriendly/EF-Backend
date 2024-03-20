const express = require('express');
const router = express.Router();
const tipController = require('../Controller/tipController');
router.get('/auto', tipController.autoTask);
router.get('/tips', tipController.getTipsByUserId);
router.get('/tips/Month', tipController.showElectricityComparison);









module.exports = router;