const express = require('express');
const roomController = require('../Controller/roomController');



const router = express.Router();




router.post('/rooms', roomController.createRoom);
router.delete('/rooms/:id',roomController.deleteRoom)
router.put('/rooms/:id',roomController.editRoom)
router.get('/rooms',roomController.getRoomsByUserId)





module.exports = router;