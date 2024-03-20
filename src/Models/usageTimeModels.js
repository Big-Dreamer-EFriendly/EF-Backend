const mongoose = require('mongoose');

const { Schema } = mongoose;

const UsageTimeSchema = new mongoose.Schema({
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
  usageByMonth: {
    type: Object,
    required: true,
  },
});

const UsageTimeModel = mongoose.model('UsageTime', UsageTimeSchema);
module.exports = UsageTimeModel;