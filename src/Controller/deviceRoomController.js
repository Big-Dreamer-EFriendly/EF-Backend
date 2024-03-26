const deviceRoomUsers = require('../Models/deviceRoomUserModels');
const mongoose = require('mongoose');
const timeUsedDevice = require('../Models/timeUseDeviceModels')
const Room = require('../Models/roomModels.js')

const { utcToZonedTime, format } = require('date-fns-tz');
const moment = require('moment-timezone');

class DeviceController {
  async getDeviceRoom(req, res) {
    const { roomId } = req.params; 

    try {
      const deviceRoomUsersData = await deviceRoomUsers.aggregate([
        {
          $match: {
            roomId: mongoose.Types.ObjectId.createFromHexString(roomId),
            isActive:true
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
            localField: 'deviceData.categoryId',
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

        const newTimeUsedDevice = new timeUsedDevice({
          deviceInRoomId:savedDeviceRoomUser._id
          });
          await newTimeUsedDevice.save();
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
    const { id, quantity, timeUsed } = req.body;
    const deviceRoomUser = await deviceRoomUsers.findById({
      id
    });

    if (!deviceRoomUser) {
      return res.status(404).json({ code:404, message: "Device don't exist." });
    }
    const previousQuantity = deviceRoomUser.quantity;

    deviceRoomUser.quantity = quantity;
    deviceRoomUser.timeUsed = timeUsed;
    const updatedDeviceRoomUser = await deviceRoomUser.save();
    const room = await Room.findById(deviceRoomUser.roomId);
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
    const { id, isStatus } = req.body;
    const deviceRoomUser = await deviceRoomUsers.findById({
      _id:id
    });
    console.log(deviceRoomUser);

    if (!deviceRoomUser) {
      return res.status(404).json({ code: 404, message: "Device doesn't exist." });
    }

    deviceRoomUser.isStatus = isStatus;
    const updatedDeviceRoomUser = await deviceRoomUser.save();

    const TimeUsedDevice = await timeUsedDevice.findOne({
      deviceInRoomId: deviceRoomUser._id
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
    const { id,temperature } = req.body;
    const deviceRoomUser = await deviceRoomUsers.findById({
    _id:id
    });


    if (!deviceRoomUser) {
      return res.status(404).json({ code:404, message: "Device don't exist." });
    }
    const previousQuantity = deviceRoomUser.quantity;


    deviceRoomUser.temperature=temperature;
    const updatedDeviceRoomUser = await deviceRoomUser.save();
    const room = await Room.findById(deviceRoomUser.roomId);
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
async deleteInDevice(req, res) {
  try {
    const { id } = req.params;

    const updatedDevice = await deviceRoomUsers.findById(id);
    const TimeUsedDevice = await timeUsedDevice.findOne({
      deviceInRoomId: id
    });
    const currentDate = moment().tz('Asia/Ho_Chi_Minh').format();

    if (!updatedDevice) {
      return res.status(404).json({ code: 404, message: 'Device not found' });
    }

    if (updatedDevice.isStatus === true) {
      updatedDevice.isStatus = false;
      await updatedDevice.save();

      if (TimeUsedDevice && !TimeUsedDevice.dateOff) {
        TimeUsedDevice.dateOff = [];
      }

      if (TimeUsedDevice) {
        TimeUsedDevice.dateOff.push(currentDate);
        await TimeUsedDevice.save();
      }
    } else {
      return res.status(400).json({ message: "Invalid device status" });
    }


    const updatedIsActive = await deviceRoomUsers.findByIdAndUpdate(id, { isActive: false }, { new: true });

    const previousQuantity = updatedDevice.quantity;

    const room = await Room.findById(updatedDevice.roomId);
    room.numberOfDevices -= previousQuantity;
    await room.save();

    res.status(204).json({ code: 204, message: 'The device has been removed from the room.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
}
}
module.exports = new DeviceController();