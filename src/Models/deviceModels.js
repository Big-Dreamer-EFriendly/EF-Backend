const mongoose = require('mongoose');
const { Schema } = mongoose;

const deviceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  powerConsumption: {
    type: Number,
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'categories', 
    required: true,
  },
});

const Device = mongoose.model('devices', deviceSchema);

module.exports = Device;