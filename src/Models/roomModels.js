const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,


  },
  floor: {
    type: String,
    required: true,
  },
  numberOfDevices: {
    type: Number,
    default: 0
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
});

// Tạo model 'Room' từ schema
const Room = mongoose.model('rooms', roomSchema);

module.exports = Room;
