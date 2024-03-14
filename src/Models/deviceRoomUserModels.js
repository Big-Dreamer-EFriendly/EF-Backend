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
  isStatus:{
    type:Boolean,
    required:false,
    default:false
  },
  timeUsed: {
    type: Number,
    default:0,
  },
  temperature: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});


const deviceRoomUsers = mongoose.model('deviceRoomUsers', DRUSchema);

module.exports = deviceRoomUsers;