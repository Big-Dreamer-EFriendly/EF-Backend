const express = require('express');
const deviceRoomController = require('../Controller/deviceRoomController');



const router = express.Router();


router.get('/devicesInRoom/:roomId', deviceRoomController.getDeviceRoom);
router.post('/devicesInRoom', deviceRoomController.addDeviceToRoom);
router.put('/devicesInRoom', deviceRoomController.updateDeviceInRoom);
router.put('/devicesInRoom/air-co', deviceRoomController.updateDeviceAirCoInRoom);

router.delete('/devicesInRoom/:id', deviceRoomController.deleteInDevice); //Tho is fixing









module.exports = router;