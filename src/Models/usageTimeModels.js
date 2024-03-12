const mongoose = require('mongoose');


const UsageTimeSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  usageByDay: {
    type: Object,
    required: true,
  },
});

// Tạo model từ schema
const UsageTimeModel = mongoose.model('UsageTime', UsageTimeSchema);
module.exports = UsageTimeModel;