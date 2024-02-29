const deviceRoomUsers = require('../Models/deviceRoomUserModels');



class DeviceController {
  async  getDeviceRoom(req, res) {
    try {
      const deviceRoomUsersData = await deviceRoomUsers.aggregate([
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
            'deviceData.powerConsumption':1,
            'deviceData.categoryId':1,
            'roomData._id': 1,
            'roomData.name': 1,
            'roomData.floor': 1,
            quantity: 1,
            timeUsed: 1,
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
    const { deviceId, roomId, quantity, timeUsed } = req.body;

    const newDeviceRoomUser = new deviceRoomUsers({
      deviceId,
      roomId,
      quantity,
      timeUsed,
    });

    const savedDeviceRoomUser = await newDeviceRoomUser.save();

    res.status(200).json({
      code:200,
      message:"Successfully",
      data:savedDeviceRoomUser});
  } catch (error) {
    res.status(500).json({code:500,message:'Internal server error' });
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
    deviceRoomUser.quantity = quantity;
    deviceRoomUser.timeUsed = timeUsed;
    const updatedDeviceRoomUser = await deviceRoomUser.save();
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

    const deletedDevice = await deviceRoomUsers.findByIdAndDelete(id);

    if (!deletedDevice) {
      return res.status(404).json({ code: 404, message: "Device doesn't exist." });
    }

    res.status(204).json({ code: 204, message: 'The device has been removed from the room.' });
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
}

}
module.exports = new DeviceController();