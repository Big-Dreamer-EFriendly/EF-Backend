const mongoose = require('mongoose');

const timeUsedDeviceSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
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