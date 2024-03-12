const express = require('express');
const deviceRoomController = require('../Controller/deviceRoomController');
const timeUsedDeviceController = require('../Controller/timeUseDeviceController');



const router = express.Router();


router.get('/devicesInRoom/:roomId', deviceRoomController.getDeviceRoom);
router.post('/devicesInRoom', deviceRoomController.addDeviceToRoom);
router.put('/devicesInRoom', deviceRoomController.updateDeviceInRoom);
router.put('/devicesInRoom/air-co', deviceRoomController.updateDeviceAirCoInRoom);
router.put('/devicesInRoom/status', deviceRoomController.updateStatusOfDeviceInRoom);
router.get('/total-hours', timeUsedDeviceController.getTotalUsageTimePerDay);



router.delete('/devicesInRoom/:id', deviceRoomController.deleteInDevice); //Tho is fixing









module.exports = router;