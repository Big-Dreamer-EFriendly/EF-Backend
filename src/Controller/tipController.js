const moment = require("moment-timezone");
const TimeUsedDevice = require("../Models/timeUseDeviceModels");
const DeviceRoomUser = require("../Models/deviceRoomUserModels");
const Room = require("../Models/roomModels");
const Tips = require("../Models/tipModels");
const User = require("../Models/userModels")

async function CompareByMonth(req, res) {
  try {
    const { user_id } = req;
    const currentMonth = moment().tz("Asia/Ho_Chi_Minh").month() + 1;
    const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();
    const rooms = await Room.find({ userId: user_id });
    const results = [];

    for (const room of rooms) {
      const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });
      console.log(deviceRoomUsers);

      for (const deviceRoomUser of deviceRoomUsers) {
        const timeUsedDevices = await TimeUsedDevice.find({ deviceInRoomId: deviceRoomUser._id });

        for (const timeUsedDevice of timeUsedDevices) {
          for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
            const dateOn = moment(timeUsedDevice.dateOn[i]).tz("Asia/Ho_Chi_Minh");
            const monthOn = dateOn.month() + 1;
            const yearOn = dateOn.year();
            const monthDiff = (currentYear - yearOn) * 12 + (currentMonth - monthOn);
            
            if (monthDiff <= 1) { // Only consider data from the last two months
              const dateOff = moment(timeUsedDevice.dateOff[i]).tz("Asia/Ho_Chi_Minh");
              const timeDifference = dateOff.diff(dateOn, "hours");
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

                const monthYear = dateOn.format("MMMM YYYY");
                const index = results.findIndex(result => result.month === monthYear);

                if (index !== -1) {
                  results[index].totalElectricityCost += electricityCostTotal;
                  results[index].totalUsageTime += usageTime;
                } else {
                  results.push({
                    month: monthYear,
                    totalElectricityCost: electricityCostTotal,
                    totalUsageTime: usageTime
                  });
                }
              }
            }
          }
        }
      }
    }
    console.log(results);

    if (results.length >= 2) {
      const sortedResults = results.sort((a, b) => moment(b.month, "MMMM YYYY").diff(moment(a.month, "MMMM YYYY")));
      const currentMonthData = sortedResults[0];
      const previousMonthData = sortedResults[1];
    
      const currentMonthUsage = currentMonthData.totalElectricityCost;
      const previousMonthUsage = previousMonthData.totalElectricityCost;
      const electricityDifference = currentMonthUsage - previousMonthUsage;
    
      let message = "";
      if (electricityDifference > 0) {
        message = `In ${currentMonthData.month}, your electricity usage increased by ${electricityDifference.toFixed(2)} VnĐ ts compared to the previous month. Please consider reducing your usage.`;
      } else if (electricityDifference < 0) {
        message = `In ${currentMonthData.month}, you saved ${Math.abs(electricityDifference).toFixed(2)} VnĐ of electricity compared to the previous month. Keep up the good work!`;
      } else {
        message = `In ${currentMonthData.month}, your electricity usage remained the same as the previous month.`;
      }
    
      await Tips.create({ content:message,title:"Notifications",userId:user_id });

      res.status(200).json({ message });
    } else {
      res.status(200).json({ message: "Insufficient data for comparison." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function CompareByWeek(req, res) {
  try {
    const { user_id } = req;
    const currentWeek = moment().tz("Asia/Ho_Chi_Minh").week();
    const previousWeek = currentWeek - 1;
    const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();
    const rooms = await Room.find({ userId: user_id });
    const results = [];
    let previousWeekData = null;

    for (const room of rooms) {
      const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });

      for (const deviceRoomUser of deviceRoomUsers) {
        const timeUsedDevices = await TimeUsedDevice.find({ deviceInRoomId: deviceRoomUser._id });

        for (const timeUsedDevice of timeUsedDevices) {
          for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
            const dateOn = moment(timeUsedDevice.dateOn[i]).tz("Asia/Ho_Chi_Minh");
            const weekOn = dateOn.week();
            const yearOn = dateOn.year();
            const weekDiff = (currentYear - yearOn) * 52 + (currentWeek - weekOn);
            
            if (weekDiff <= 1) { // Only consider data from the last two weeks
              const dateOff = moment(timeUsedDevice.dateOff[i]).tz("Asia/Ho_Chi_Minh");
              const timeDifference = dateOff.diff(dateOn, "hours");
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

                const weekYear = dateOn.format("WW YYYY");
                const index = results.findIndex(result => result.week === weekYear);

                if (index !== -1) {
                  results[index].totalElectricityCost += electricityCostTotal;
                  results[index].totalUsageTime += usageTime;
                } else {
                  results.push({
                    week: weekYear,
                    totalElectricityCost: electricityCostTotal,
                    totalUsageTime: usageTime
                  });
                }
              }
            }
          }
        }
      }
    }
    console.log(results);

    if (results.length >= 1) {
      const sortedResults = results.sort((a, b) => moment(b.week, "WW YYYY").diff(moment(a.week, "WW YYYY")));
      const currentWeekData = sortedResults.find(result => result.week === `${currentWeek} ${currentYear}`);
      
      if (currentWeekData) {
        const currentWeekUsage = currentWeekData.totalElectricityCost;
        let message = `In week ${currentWeek} of ${currentYear}, you have used ${currentWeekUsage} kWh of electricity.`;

        if (results.length >= 2) {
          previousWeekData = sortedResults.find(result => result.week === `${previousWeek} ${currentYear}`);
          const previousWeekUsage = previousWeekData.totalElectricityCost;
          const electricityDifference = currentWeekUsage - previousWeekUsage;

          if (electricityDifference > 0) {
            message += ` Your electricity usage increased by ${electricityDifference} kWh compared to the previous week.`;
          }else if (electricityDifference < 0) {
            message += ` Your electricity usage decreased by ${Math.abs(electricityDifference)} kWh compared to the previous week.`;
          } else {
            message += ` Your electricity usage remained the same as the previous week.`;
          }
        }
        await Tips.create({ content:message,title:"Notifications",userId:user_id });

        return res.status(200).json({ title: "Notifications", content: message, userId: user_id });
      } else {
        return res.status(400).json({ message: "No data available for the current week." });
      }
    } else {
      return res.status(400).json({ message: "No data available for the past two weeks." });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred." });
  }
}
async function addTips(req, res) {
  try {
    const { title, content } = req.body;
    const allUsers = await User.find();
    const userIds = allUsers.map(user => user._id);
    const pushTipsPromises = userIds.map(async (userId) => {
      const newTips = new Tips({
        title,
        content,
        userId: userId
      });
      const savedTips = await newTips.save();
      return savedTips;
    });

    const savedTips = await Promise.all(pushTipsPromises);

    res.status(200).json({
      code: 200,
      message: 'success',
      data: savedTips,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
}

async function getTipByUserId (req,res){
  try {
    const {user_id}=req;
    const tips = await Tips.find({userId: user_id });
    res.status(200).json({ tips });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function updateStatusRead(req, res) {
  try {
    const { user_id } = req;
    const { id } = req.body;
    const tip = await Tips.findOneAndUpdate(
      { userId: user_id, _id: id },
      { isRead: true },
      { new: true }
    );

    if (!tip) {
      return res.status(404).json({ error: "Tip not found" });
    }

    res.status(200).json({ tip });
  } catch (error) {
    console.error("Error occurred while updating status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
module.exports = {
  CompareByMonth,
  getTipByUserId,
  updateStatusRead,
  CompareByWeek,
  addTips
};