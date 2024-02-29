const express = require('express');
const deviceController = require('../Controller/deviceController');



const router = express.Router();




// router.get('/categories', deviceController.getAllCategories);
router.get('/devices/category/:categoryId', deviceController.getDevicesByCategoryId);

// router.get('/devices', deviceController.getAllDevices);

module.exports = router;