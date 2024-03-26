const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const tipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default:false,
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});


const Tip = mongoose.model('tips', tipSchema);

module.exports = Tip;
