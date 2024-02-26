const mongoose = require('mongoose');
const { Schema } = mongoose;


const DRUSchema = new Schema({

  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'devices', 
    required: true,
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'rooms', 
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  timeUsed: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});


const deviceRoomUsers = mongoose.model('deviceRoomUsers', DRUSchema);

module.exports = deviceRoomUsers;