const deviceRoomUsers = require('../Models/deviceRoomUserModels');
const mongoose = require('mongoose');
const timeUsedDevice = require('../Models/timeUseDeviceModels')
const Room = require('../Models/roomModels.js')

const { utcToZonedTime, format } = require('date-fns-tz');
const moment = require('moment-timezone');

class DeviceController {
  async getDeviceRoom(req, res) {
    const { roomId } = req.params; // Giả sử roomId được truyền vào như một tham số

    try {
      const deviceRoomUsersData = await deviceRoomUsers.aggregate([
        {
          $match: {
            roomId: mongoose.Types.ObjectId.createFromHexString(roomId) // Chuyển đổi roomId sang kiểu ObjectId
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
          $lookup: {
            from: 'categories',
            localField: 'deviceData.categoryId', // Trường categoryId trong bảng devices
            foreignField: '_id',
            as: 'categoryData'
          }
        },
        {
          $unwind: '$categoryData'
        },
        {
          $project: {
            'deviceData._id': 1,
            'deviceData.name': 1,
            'deviceData.capacity': 1,
            'deviceData.imageUrl':1,
            'deviceData.categoryId': 1,
          
            'categoryData.name': 1, 
          
            'roomData._id': 1,
            'roomData.name': 1,
            'roomData.floor': 1,
            quantity: 1,
            timeUsed: 1,
            isStatus: 1,
            temperature: 1,
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

  async  addDeviceToRoom(req, res) {
    try {
      const { deviceId, roomId ,temperature, total } = req.body;
  
      const newTimeUsedDevice = new timeUsedDevice({
        deviceId,
        roomId,
      });
  
      await newTimeUsedDevice.save();
  
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ code: 404, message: 'Room not found' });
      }
  
      let savedDeviceRoomUser;
  
      for (let i = 0; i < total; i++) {
        const newDeviceRoomUser = new deviceRoomUsers({
          deviceId,
          roomId,
          quantity: 1,
          temperature,
        });
  
        savedDeviceRoomUser = await newDeviceRoomUser.save();

      }
      room.numberOfDevices += total;

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
  }
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
}
async  updateStatusOfDeviceInRoom(req, res) {
  try {
    const { deviceId, roomId, isStatus } = req.body;
    const deviceRoomUser = await deviceRoomUsers.findOne({
      deviceId,
      roomId,
    });

    if (!deviceRoomUser) {
      return res.status(404).json({ code: 404, message: "Device doesn't exist." });
    }

    deviceRoomUser.isStatus = isStatus;
    const updatedDeviceRoomUser = await deviceRoomUser.save();

    const TimeUsedDevice = await timeUsedDevice.findOne({
      roomId: deviceRoomUser.roomId,
      deviceId: deviceRoomUser.deviceId,
    });

    if (!TimeUsedDevice) {
      return res.status(404).json({ message: "Time used device not found" });
    }

    const currentDate = moment().tz('Asia/Ho_Chi_Minh').format();
    console.log(currentDate);
    if (deviceRoomUser.isStatus === true) {
      if (!TimeUsedDevice.dateOn) {
        TimeUsedDevice.dateOn = [];
      }
      TimeUsedDevice.dateOn.push(currentDate);
    } else if (deviceRoomUser.isStatus === false) {
      if (!TimeUsedDevice.dateOff) {
        TimeUsedDevice.dateOff = [];
      }
      TimeUsedDevice.dateOff.push(currentDate);
    } else {
      return res.status(400).json({ message: "Invalid device status" });
    }

    const updatedTimeUsedDevice = await TimeUsedDevice.save();

    res.status(200).json({
      code: 200,
      message: "Successfully updated status of device in room.",
      data: updatedDeviceRoomUser,
      updatedTimeUsedDevice,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
}

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
}
  async  deleteInDevice(req, res) {
    try {
      const { id } = req.params;
  

      const deletedDevice = await deviceRoomUsers.findByIdAndDelete(id);
  
    
      const previousQuantity = deletedDevice.quantity;
  
  
      const room = await Room.findById(deletedDevice.roomId);
      room.numberOfDevices -= previousQuantity;
      await room.save();
  
      res.status(204).json({ code: 204, message: 'The device has been removed from the room.' });
    } catch (error) {
      res.status(500).json({ code: 500, message: 'Internal server error' });
    }
  }

}
module.exports = new DeviceController();