// totalElectricityCostModels.js
const mongoose = require('mongoose');

const totalElectricityCostSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  electricityCost: {
    type: Number,
    required: true
  }
});

const TotalElectricityCost = mongoose.model('TotalElectricityCost', totalElectricityCostSchema);

module.exports = TotalElectricityCost;