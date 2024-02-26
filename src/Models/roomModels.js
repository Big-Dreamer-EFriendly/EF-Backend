const mongoose = require('mongoose');


const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    validate: {
      validator: function (name) {
        const regex = /^[a-zA-Z\s]+$/;
        return regex.test(name);
      },
      message: 'Invalid room name',
    },
  },
  floor: {
    type: String,
    required: true,
  },
});

// Tạo model 'Room' từ schema
const Room = mongoose.model('rooms', roomSchema);

module.exports = Room;