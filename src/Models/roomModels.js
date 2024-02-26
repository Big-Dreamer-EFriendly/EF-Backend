const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 
    { value: 2,
    message: 'A password must contain at least 2 characters' },

  },
  floor: {
    type: String,
    required: true,
  },  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
});

// Tạo model 'Room' từ schema
const Room = mongoose.model('rooms', roomSchema);

module.exports = Room;