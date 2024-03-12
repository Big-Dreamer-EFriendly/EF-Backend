const moment = require('moment-timezone');
const TimeUsedDevice = require('../Models/timeUseDeviceModel');
const UsageTimeModel = require('../Models/usageTimeModels');

// Controller function to get total usage time per day
exports.getTotalUsageTimePerDay = async (req, res) => {
  try {
    const { roomId } = req.body;

    const timeUsedDevices = await TimeUsedDevice.find({ roomId });

    const usageByDay = {};

    timeUsedDevices.forEach((timeUsedDevice) => {
      for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
        const dateOn = moment(timeUsedDevice.dateOn[i]).tz('Asia/Ho_Chi_Minh');
        const dateOff = moment(timeUsedDevice.dateOff[i]).tz('Asia/Ho_Chi_Minh');

        let dayOn = dateOn.date();
        let monthOn = dateOn.month() + 1; // Cộng 1 để bù cho việc Moment.js đánh số tháng từ 0 đến 11
        let yearOn = dateOn.year();

        let keyOn = `${dayOn}-${monthOn}-${yearOn}`;

        let timeDifferenceOn = Math.min(dateOff.diff(dateOn, 'hours'), 24);
        if (usageByDay[keyOn]) {
          usageByDay[keyOn] += timeDifferenceOn;
        } else {
          usageByDay[keyOn] = timeDifferenceOn;
        }

        if (dateOff.diff(dateOn, 'hours') > 24) {
          const nextDay = dateOn.add(1, 'day');
          dayOn = nextDay.date();
          monthOn = nextDay.month() + 1; // Cộng 1 để bù cho việc Moment.js đánh số tháng từ 0 đến 11
          yearOn = nextDay.year();

          const keyNextDay = `${dayOn}-${monthOn}-${yearOn}`;

          const timeDifferenceOffNextDay = dateOff.hours(0).diff(dateOff, 'hours');
          if (usageByDay[keyNextDay]) {
            usageByDay[keyNextDay] += timeDifferenceOffNextDay;
          } else {
            usageByDay[keyNextDay] = timeDifferenceOffNextDay;
          }

          if (usageByDay[keyNextDay]) {
            usageByDay[keyNextDay] += 24;
          } else {
            usageByDay[keyNextDay] = 24;
          }
        }
      }
    });

    const usageTimeData = {
      roomId: roomId,
      usageByDay: usageByDay,
    };

    const newUsageTime = new UsageTimeModel(usageTimeData);

    await newUsageTime.save();

    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};