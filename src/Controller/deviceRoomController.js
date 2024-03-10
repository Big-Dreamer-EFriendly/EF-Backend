const deviceRoomUsers = require('../Models/deviceRoomUserModels');
const mongoose = require('mongoose');

const Room = require('../Models/roomModels.js')


class DeviceController {
  async  getDeviceRoom(req, res) {
    const { roomId } = req.params; // Assuming the room ID is passed as a parameter
  
    try {
      const deviceRoomUsersData = await deviceRoomUsers.aggregate([
        {
          $match: {
            roomId: mongoose.Types.ObjectId.createFromHexString(roomId) // Convert the room ID to ObjectId type
          }
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
          $lookup: {
            from: 'devices',
            localField: 'deviceId',
            foreignField: '_id',
            as: 'deviceData'
          }
        },
        {
          $unwind: '$deviceData'
        },
        {
          $project: {
            'deviceData._id': 1,
            'deviceData.name': 1,
            'deviceData.powerConsumption': 1,
            'deviceData.categoryId': 1,
            'roomData._id': 1,
            'roomData.name': 1,
            'roomData.floor': 1,
            quantity: 1,
            timeUsed: 1,
            temperature:1,
            createdAt: 1
          }
        },
      ]);
  
      res.status(200).json({ code: 200, message: 'Successfully', data: deviceRoomUsersData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 500, message: 'Internal server error' });
    }
  }
  async addDeviceToRoom (req, res)  {
    try {
      const { deviceId, roomId, quantity, timeUsed,temperature } = req.body;
  
      const newDeviceRoomUser = new deviceRoomUsers({
        deviceId,
        roomId,
        quantity,
        timeUsed,
        temperature
    
      });
  
      const savedDeviceRoomUser = await newDeviceRoomUser.save();
  
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ code: 404, message: 'Room not found' });
      }
  
      room.numberOfDevices += quantity;
      await room.save();
  
      res.status(200).json({
        code: 200,
        message: 'Successfully added device to room',
        data: savedDeviceRoomUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 500, message: 'Internal server error' });
    }
};
async updateDeviceInRoom  (req, res){
  try {
    const { deviceId, roomId, quantity, timeUsed } = req.body;
    const deviceRoomUser = await deviceRoomUsers.findOne({
      deviceId,
      roomId,
    });

    if (!deviceRoomUser) {
      return res.status(404).json({ code:404, message: "Device don't exist." });
    }
    const previousQuantity = deviceRoomUser.quantity;

    deviceRoomUser.quantity = quantity;
    deviceRoomUser.timeUsed = timeUsed;
    const updatedDeviceRoomUser = await deviceRoomUser.save();
    const room = await Room.findById(roomId);
    room.numberOfDevices += deviceRoomUser.quantity - previousQuantity;
    await room.save();
    res.status(200).json(  {    
      code:200,
      message:"Successfully",
      data:updatedDeviceRoomUser});
  } catch (error) {
    res.status(500).json({ code:500,message:'Internal server error' });
  }
};
async updateDeviceAirCoInRoom  (req, res){
  try {
    const { deviceId, roomId, quantity, timeUsed,temperature } = req.body;
    const deviceRoomUser = await deviceRoomUsers.findOne({
      deviceId,
      roomId,
    });


    if (!deviceRoomUser) {
      return res.status(404).json({ code:404, message: "Device don't exist." });
    }
    const previousQuantity = deviceRoomUser.quantity;

    deviceRoomUser.quantity = quantity;
    deviceRoomUser.timeUsed = timeUsed;
    deviceRoomUser.temperature=temperature;
    const updatedDeviceRoomUser = await deviceRoomUser.save();
    const room = await Room.findById(roomId);
    room.numberOfDevices += deviceRoomUser.quantity - previousQuantity;
    await room.save();
    res.status(200).json(  {    
      code:200,
      message:"Successfully",
      data:updatedDeviceRoomUser});
  } catch (error) {
    res.status(500).json({ code:500,message:'Internal server error' });
  }
};
async  deleteInDevice(req, res) {
  try {
    const { id } = req.params;

    const device = await deviceRoomUsers.findById(id);

    if (!device) {
      return res.status(404).json({ code: 404, message: "Device doesn't exist." });
    }

    const previousQuantity = device.quantity;

    const deletedDevice = await deviceRoomUsers.findByIdAndDelete(id);

    const room = await Room.findById(device.roomId);
    room.numberOfDevices -= previousQuantity;
    await room.save();

    res.status(204).json({ code: 204, message: 'The device has been removed from the room.' });
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
}

}
module.exports = new DeviceController();