const mongoose = require('mongoose');

const timeUsedDeviceSchema = new mongoose.Schema({

  deviceInRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rooms',
    required: true,
  },
  dateOn: {
    type: [String],
    default: [],
  },
  dateOff: {
    type: [String],
    default: [],
  },
});

const TimeUsedDevice = mongoose.model('TimeUsedDevice', timeUsedDeviceSchema);

module.exports = TimeUsedDevice;