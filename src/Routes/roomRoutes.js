const express = require('express');
const roomController = require('../Controller/roomController');



const router = express.Router();




router.post('/add-room', roomController.addRoom);



module.exports = router;