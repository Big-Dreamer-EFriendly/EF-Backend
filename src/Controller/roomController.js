const Room = require('../Models/roomModels.js')
const deviceRoomUsers = require('../Models/deviceRoomUserModels');

class RoomController {
  async  getRoomsByUserId(req, res) {
    try {
      const { user_id } = req;
      const roomsData = await Room.find({ userId: user_id });
      const roomIds = roomsData.map(room => room._id);

      const deviceRoomUsersData = await deviceRoomUsers.aggregate([
        {
          $match: { roomId: { $in: roomIds } }
        },
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'roomData'
          }
        },
        {
          $unwind: '$roomData'
        },
        {
          $group: {
            _id: {
              roomId: '$roomData._id',
              name: '$roomData.name'
            },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]);
  
      res.status(200).json({ code: 200, message: 'Successfully',roomData:roomsData, data: deviceRoomUsersData });
  
    } catch (error) {
      res.status(500).json({ code: 500, message: 'Internal server error' });
    }
  }
  
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
  
  async  deleteRoom(req, res) {
    try {
      const roomId = req.params.id;
  
      const roomExists = await deviceRoomUsers.exists({ roomId });
  
      if (roomExists) {

        await deviceRoomUsers.deleteMany({ roomId });
      }
  
      const deletedRoom = await Room.findByIdAndDelete(roomId);
  
      if (!deletedRoom) {
        return res.status(404).json({ code: 404, message: 'Room not found' });
      }
  
      res.status(204).json({ code: 204, message: 'Room deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 500, message: 'Internal server error' });
    }
  }
  async editRoom (req, res) {
    try {
      const roomId = req.params.id;
      const { name, floor } = req.body; 

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Phòng không tồn tại.' });
      }
  

      room.name = name;
      room.floor = floor;
      const updatedRoom = await room.save();
  
      res.status(200).json({code: 200, message:"Successfully",data:updatedRoom});
    } catch (error) {
      res.status(500).json({ code:500,message: 'Internal server error' });
    }
  };
}

module.exports = new RoomController();