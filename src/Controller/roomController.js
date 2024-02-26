const Room = require('../Models/roomModels.js')
const DeviceRoomUser= require('../Models/deviceRoomUserModels.js')
class RoomController {
  async createRoom(req, res) {
    try {
      const { name, floor } = req.body;

      const { user_id } = req;
      const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (specialCharsRegex.test(name) && !name.includes(' ') ||specialCharsRegex.test(name)) {
      return res.status(400).json({ code:400,message: 'Invalid characters in name' });
    }
  
      const newRoom = new Room({
        name,
        floor,
        userId:user_id,
      });
  
      const savedRoom = await newRoom.save();
  
      res.status(200).json({
        code:200,
        message:'success',
        data: savedRoom});

    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 500,message: 'Internal server error' });
    }
  }
  
  async deleteRoom(req, res) {
    try {
      const roomId = req.params.id;

    
      const deletedRoom = await Room.findByIdAndDelete(roomId);
      if (!deletedRoom) {
        return res.status(404).json({code:404, message: 'Room not found' });
      }

      await DeviceRoomUser.deleteMany({ roomId });

      res.status(200).json({  code: 200,message: 'Room deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code:500,message: 'Internal server error' });
    }
  }
}

module.exports = new RoomController();