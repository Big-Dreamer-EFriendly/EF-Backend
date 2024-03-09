const deviceRoomUsers = require('../Models/deviceRoomUserModels');
const Room = require('../Models/roomModels');

const getAllDevicesInRoomByUserId = async (req, res) => {
  const { user_id } = req;

  try {
    const roomsData = await Room.find({ userId: user_id });

    if (!roomsData) {
      return res.status(404).json({ message: 'Room not found' });
    }

    let devices = [];
    let totalStatistic = 0;

    for (const room of roomsData) {
      const roomDevices = await deviceRoomUsers
        .find({ roomId: room._id })
        .populate('deviceId', 'capacity name');

      if (roomDevices.length > 0) {
        for (const device of roomDevices) {
          const deviceCapacity = device.deviceId?.capacity;
          if (!deviceCapacity) {
            throw new Error(`Capacity not found for device with ID: ${device._id}`);
          }

          let totalCapacity =   parseFloat(deviceCapacity) * device.timeUsed;
          let StatisticByRoom = 0;

          if (totalCapacity >= 401) {
            StatisticByRoom += (totalCapacity - 400) * 3015;
            totalCapacity = 400;
          } else if (totalCapacity >= 301) {
            StatisticByRoom += (totalCapacity - 300) * 2919;
            totalCapacity = 300;
          } else if (totalCapacity >= 201) {
            StatisticByRoom += (totalCapacity - 200) * 2612;
            totalCapacity = 200;
          } else if (totalCapacity >= 101) {
            StatisticByRoom += (totalCapacity - 100) * 2074;
            totalCapacity = 100;
          } else if (totalCapacity >= 50) {
            StatisticByRoom += (totalCapacity - 50) * 1786;
            totalCapacity = 50;
          } else if (totalCapacity < 50) {
            StatisticByRoom = totalCapacity * 1728;

          }
          totalStatistic += StatisticByRoom * device.quantity;
          devices.push({
            roomId: room._id,
            deviceId:device.deviceId,
            timeUsed:device.timeUsed,
            quantity: device.quantity,
            Consumption: totalCapacity,
            StatisticByRoom : StatisticByRoom * device.quantity,
          });
        }
      }
    }

    if (devices.length === 0) {
      return res.status(404).json({ message: 'No devices found in any room' });
    }

    res.status(200).json({ devices, totalStatistic: totalStatistic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDevicesInRoomByUserId,
};