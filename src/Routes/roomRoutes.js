const express = require('express');
const roomController = require('../Controller/roomController');



const router = express.Router();




router.post('/create-room', roomController.createRoom);
router.post('/delete-room/:id',roomController.deleteRoom)



module.exports = router;