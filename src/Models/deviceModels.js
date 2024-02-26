const mongoose = require('mongoose');
const { Schema } = mongoose;

const deviceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  wattage: {
    type: Number,
    required: true,
  },
  categoriesId: {
    type: Schema.Types.ObjectId,
    ref: 'categories', 
    required: true,
  },
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;