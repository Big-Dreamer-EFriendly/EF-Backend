
const Room = require('../Models/roomModels')
const TimeUsedDevice = require("../Models/timeUseDeviceModels");
const DeviceRoomUser = require("../Models/deviceRoomUserModels");
const Category= require("../Models/categoryModels")
const Tip = require("../Models/tipModels")
async function getTipsByUserId(req, res) {
  try {
    const { id } = req; 
    const tips = await Tip.find({ userId:id });
    res.status(200).json({ code: 200, data:tips });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server' });
  }
}
async function showElectricityComparison(req, res) {
  try {
    const { user_id } = req;
    const currentMonth = moment().tz("Asia/Ho_Chi_Minh").startOf('month');
    const previousMonth = currentMonth.clone().subtract(1, 'month').startOf('month');

    const currentMonthResult = await getTotalElectricityByMonth(user_id, currentMonth);
    const previousMonthResult = await getTotalElectricityByMonth(user_id, previousMonth);

    const comparison = {
      currentMonth: currentMonthResult,
      previousMonth: previousMonthResult
    };

    res.status(200).json(comparison);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getTotalElectricityByMonth(user_id, month) {
  const rooms = await Room.find({ userId: user_id });
  const results = {};

  for (const room of rooms) {
    const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });

    for (const deviceRoomUser of deviceRoomUsers) {
      const timeUsedDevices = await TimeUsedDevice.find({ deviceInRoomId: deviceRoomUser._id });

      for (const timeUsedDevice of timeUsedDevices) {
        for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
          const dateOn = moment(timeUsedDevice.dateOn[i]).tz("Asia/Ho_Chi_Minh").startOf('day');
          const isSameMonth = dateOn.isSame(month, 'month');

          if (isSameMonth && dateOn.isSameOrBefore(moment(), 'day')) {
            const dateKey = dateOn.format('YYYY-MM-DD');
            const dateOff = moment(timeUsedDevice.dateOff[i]).tz("Asia/Ho_Chi_Minh");
            const timeDifference = dateOff.diff(timeUsedDevice.dateOn[i], "hours");
            const deviceRoomUserPopulated = await DeviceRoomUser.findById(deviceRoomUser._id).populate('deviceId');

            if (deviceRoomUserPopulated) {
              const deviceId = deviceRoomUserPopulated.deviceId._id;
              const deviceCapacity = deviceRoomUserPopulated.deviceId.capacity || 0;
              const usageTime = timeDifference * deviceCapacity;
              let electricityCostTotal = 0;

              if (usageTime >= 401) {
                electricityCostTotal += (usageTime - 400) * 3015 + 300 * 2919 + 200 * 2612 + 100 * 2074 + 50 * 1786 + 50 * 1782;
              } else if (usageTime >= 301) {
                electricityCostTotal += (usageTime - 300) * 2919 + 200 * 2612 + 100 * 2074 + 50 * 1786 + 50 * 1782;
              } else if (usageTime >= 201) {
                electricityCostTotal += (usageTime - 200) * 2612 + 100 * 2074 + 50 * 1786 + 50 * 1782;
              } else if (usageTime >= 101) {
                electricityCostTotal += (usageTime - 100) * 2074 + 50 * 1786 + 50 * 1782;
              } else if (usageTime >= 51) {
                electricityCostTotal += (usageTime - 50) * 1786 + 50 * 1782;
              } else {
                electricityCostTotal += usageTime * 1782;
              }

              if (results[dateKey]) {
                results[dateKey].kWh += usageTime;
                results[dateKey].total += electricityCostTotal;
              } else {
                results[dateKey] = {
                  kWh: usageTime,
                  total: electricityCostTotal
                };
              }
            }
          }
        }
      }
    }
  }

  const lastDay = month.clone().endOf('month').date();
  const dates = [];
  for (let i = 1; i <= lastDay; i++) {
    const date = month.clone().date(i).format('YYYY-MM-DD');
    dates.push(date);
  }

  const finalResults = dates.map(date => ({
    date,
    kWh: results[date]?.kWh || 0,
    total: results[date]?.total || 0
  }));

  return finalResults;
}



async function saveTipData(req,res) {
  const currentDate = moment().tz("Asia/Ho_Chi_Minh").startOf('day');
  const lastDay = currentDate.clone().endOf('month').date();
  const currentMonthKey = currentDate.format('YYYY-MM');
  const {user_id} = req;


    const title = `Electricity Usage - ${currentDate.format('MMMM YYYY')}`;
    const content = "Monthly electricity usage and cost report";

    const tip = new Tip({
      title,
      content,
      userId: user_id
    });

    await tip.save();
    console.log('Tip data saved successfully.');
  
}
function autoTask() {
  console.log('Auto task executed.');

}



module.exports = {
  getTipsByUserId,
  showElectricityComparison,
  saveTipData,
  autoTask

};
