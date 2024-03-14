const deviceRoomUsers = require('../Models/deviceRoomUserModels');
const Room = require('../Models/roomModels');

const moment = require('moment-timezone');
const TimeUsedDevice = require('../Models/timeUseDeviceModels');
const UsageTimeModel = require('../Models/usageTimeModels');

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


// Controller function to get total usage time per day
exports.getTotalUsageTimePerDay = async (req, res) => {
  try {
    const { roomId } = req.body;

    const timeUsedDevices = await TimeUsedDevice.find({ roomId });

    const usageTimeDataArray = [];

    timeUsedDevices.forEach((timeUsedDevice) => {
      const usageByDevice = {};

      for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
        const dateOn = moment(timeUsedDevice.dateOn[i]).tz('Asia/Ho_Chi_Minh');
        const dateOff = moment(timeUsedDevice.dateOff[i]).tz('Asia/Ho_Chi_Minh');

        let dayOn = dateOn.date();
        let monthOn = dateOn.month() + 1; // Cộng 1 để bù cho việc Moment.js đánh số tháng từ 0 đến 11
        let yearOn = dateOn.year();

        let keyOn = `${dayOn}-${monthOn}-${yearOn}`;

        let timeDifferenceOn = Math.min(dateOff.diff(dateOn, 'hours'), 24);
        if (usageByDevice[timeUsedDevice.deviceId]) {
          usageByDevice[timeUsedDevice.deviceId] += timeDifferenceOn;
        } else {
          usageByDevice[timeUsedDevice.deviceId] = timeDifferenceOn;
        }

        if (dateOff.diff(dateOn, 'hours') > 24) {
          const nextDay = dateOn.add(1, 'day');
          dayOn = nextDay.date();
          monthOn = nextDay.month() + 1; // Cộng 1 để bù cho việc Moment.js đánh số tháng từ 0 đến 11
          yearOn = nextDay.year();

          const keyNextDay = `${dayOn}-${monthOn}-${yearOn}`;

          const timeDifferenceOffNextDay = dateOff.hours(0).diff(dateOff, 'hours');
          if (usageByDevice[timeUsedDevice.deviceId]) {
            usageByDevice[timeUsedDevice.deviceId] += timeDifferenceOffNextDay;
          } else {
            usageByDevice[timeUsedDevice.deviceId] = timeDifferenceOffNextDay;
          }

          if (usageByDevice[timeUsedDevice.deviceId]) {
            usageByDevice[timeUsedDevice.deviceId] += 24;
          } else {
            usageByDevice[timeUsedDevice.deviceId] = 24;
          }
        }
      }

      for (const deviceId in usageByDevice) {
        const usageTimeData = {
          roomId: roomId,
          deviceId: deviceId,
          usageByDay: usageByDevice[deviceId],
        };

        usageTimeDataArray.push(usageTimeData);
      }
    });

    const usageTimePromises = usageTimeDataArray.map((usageTimeData) => {
      const newUsageTime = new UsageTimeModel(usageTimeData);
      return newUsageTime.save();
    });

    await Promise.all(usageTimePromises);

    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};
