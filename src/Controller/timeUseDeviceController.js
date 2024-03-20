const moment = require("moment-timezone");
const TimeUsedDevice = require("../Models/timeUseDeviceModels");
const UsageTimeModel = require("../Models/usageTimeModels");
const DeviceRoomUser = require("../Models/deviceRoomUserModels");
const Category= require("../Models/categoryModels")

const Device = require("../Models/deviceModels");
const Room = require("../Models/roomModels");
class statisticController {
  async getTotalUsageTimeByMonth(req, res) {
    try {
      const { roomId } = req.params;
      const currentMonth = moment().tz("Asia/Ho_Chi_Minh").month() + 1;
      const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();
  
      const deviceRoomUsers = await DeviceRoomUser.find({ roomId: roomId });
  
      const usageByMonth = {};
  
      for (const deviceRoomUser of deviceRoomUsers) {
        const deviceInRoomId = deviceRoomUser._id;
        console.log(deviceInRoomId);
  
        const timeUsedDevices = await TimeUsedDevice.find({ deviceInRoomId: deviceInRoomId });
  
        for (const timeUsedDevice of timeUsedDevices) {
          for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
            const dateOn = moment(timeUsedDevice.dateOn[i]).tz("Asia/Ho_Chi_Minh");
            const dateOff = moment(timeUsedDevice.dateOff[i]).tz("Asia/Ho_Chi_Minh");
  
            const monthOn = dateOn.month() + 1;
            const yearOn = dateOn.year();
  
            if (monthOn === currentMonth && yearOn === currentYear) {
              const dayOn = dateOn.date();
  
              if (!usageByMonth[currentMonth]) {
                usageByMonth[currentMonth] = {};
              }
  
              if (!usageByMonth[currentMonth][dayOn]) {
                usageByMonth[currentMonth][dayOn] = {};
              }
  
              let timeDifference = dateOff.diff(dateOn, "hours");
  
              if (!usageByMonth[currentMonth][dayOn][deviceInRoomId]) {
                usageByMonth[currentMonth][dayOn][deviceInRoomId] = 0;
              }
  
              usageByMonth[currentMonth][dayOn][deviceInRoomId] += timeDifference;
              console.log(timeDifference);
            }
          }
        }
      }
  
      const totalElectricityCostByDevice = {};
      const deviceInfoArray = [];
  
      for (const month in usageByMonth) {
        for (const day in usageByMonth[month]) {
          for (const deviceInRoomId in usageByMonth[month][day]) {
            const usageTime = usageByMonth[month][day][deviceInRoomId];
            const deviceRoomUser = await DeviceRoomUser.findById(deviceInRoomId).populate('deviceId');
            if (deviceRoomUser) {
              const device = deviceRoomUser.deviceId;
              const category = await Category.findById(device.categoryId);
              let electricityCost = usageTime * device.capacity;
  
              let electricityCostTotal = 0;
              let Kwh = 0;
              Kwh = electricityCost;
                if (electricityCost >= 401) {
                electricityCostTotal += (electricityCost - 400) * 3015;
                electricityCost -= (electricityCost - 400);
                electricityCostTotal += (electricityCost - 300) * 2919;
                electricityCost -= (electricityCost - 300);
                electricityCostTotal += (electricityCost - 200) * 2612;
                electricityCost -= (electricityCost - 200);
                electricityCostTotal += (electricityCost - 100) * 2074;
                electricityCost -= (electricityCost - 100);
                electricityCostTotal += (electricityCost - 50) * 1678;
                electricityCost -= (electricityCost - 50);
                electricityCostTotal += electricityCost * 1672;
              } else if (electricityCost >= 301) {
                electricityCostTotal += (electricityCost - 300) * 2919;
                electricityCost -= (electricityCost - 300);
                electricityCostTotal += (electricityCost - 200) * 2612;
                electricityCost -= (electricityCost - 200);
                electricityCostTotal += (electricityCost - 100) * 2074;
                electricityCost -= (electricityCost - 100);
                electricityCostTotal += (electricityCost - 50) * 1678;
                electricityCost -= (electricityCost - 50);
                electricityCostTotal += electricityCost * 1672;
              } else if (electricityCost >= 201) {
                electricityCostTotal += (electricityCost - 200) * 2612;
                electricityCost -= (electricityCost - 200);
                electricityCostTotal += (electricityCost - 100) * 2074;
                electricityCost -= (electricityCost - 100);
                electricityCostTotal += (electricityCost - 50) * 1678;
                electricityCost -= (electricityCost - 50);
                electricityCostTotal += electricityCost * 1672;
              } else if (electricityCost >= 101) {
                electricityCostTotal += (electricityCost - 100) * 2074;
                electricityCost -= (electricityCost - 100);
                electricityCostTotal += (electricityCost - 50) * 1678;
                electricityCost -= (electricityCost - 50);
                electricityCostTotal += electricityCost * 1672;
              } else if (electricityCost >= 51) {
                electricityCostTotal += (electricityCost - 50) * 1678;
                electricityCost -= (electricityCost - 50);
                electricityCostTotal += electricityCost * 1672;
              }
              else {
                electricityCostTotal += electricityCost * 1672;
              }
  
              if (!totalElectricityCostByDevice[device._id]) {
                totalElectricityCostByDevice[device._id] = 0;
              }
              totalElectricityCostByDevice[device._id] += electricityCostTotal;
  
              deviceInfoArray.push({
                deviceName: device.name,
                categoryName: category.name,
                kWh:Kwh,
                usageTime: usageTime,
                electricityCost: electricityCostTotal
              });
            }
          }
        }
      }
  
      // const totalUsageTimeByDate = {};
  
      // for (const month in usageByMonth) {
      //   for (const day in usageByMonth[month]) {
      //     const totalUsageTime = Object.values(usageByMonth[month][day]).reduce((total, time) => total + time, 0);
      //     const date = `${day}-${month}-${currentYear}`;
      //     totalUsageTimeByDate[date] = totalUsageTime;
      //   }
      // }
  
      res.status(200).json({
        // totalUsageTimeByDate: totalUsageTimeByDate,
        deviceInfoArray: deviceInfoArray
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  async getTotalCostOfDevices(req, res) {
    try {
      const { user_id } = req;
      const currentMonth = moment().tz("Asia/Ho_Chi_Minh").month() + 1;
      const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();
      const rooms = await Room.find({ userId: user_id });
      const totalElectricityCostByDevice = {};
      let totalCost = 0;
      let totalElectricityCost = 0;
      let totalUsageTime = 0;

      for (const room of rooms) {
        const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });
  
        for (const deviceRoomUser of deviceRoomUsers) {
          const timeUsedDevices = await TimeUsedDevice.find({ deviceInRoomId: deviceRoomUser._id });
  
          for (const timeUsedDevice of timeUsedDevices) {
            for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
              const dateOn = moment(timeUsedDevice.dateOn[i]).tz("Asia/Ho_Chi_Minh");
              const monthOn = dateOn.month() + 1;
              const yearOn = dateOn.year();
  
              if (monthOn === currentMonth && yearOn === currentYear) {
                const dateOff = moment(timeUsedDevice.dateOff[i]).tz("Asia/Ho_Chi_Minh");
                const timeDifference = dateOff.diff(dateOn, "hours")
                const deviceRoomUserPopulated = await DeviceRoomUser.findById(deviceRoomUser._id).populate('deviceId');
  
                if (deviceRoomUserPopulated) {
                  const deviceId = deviceRoomUserPopulated.deviceId._id;
                  const deviceCapacity = deviceRoomUserPopulated.deviceId.capacity || 0;
                  let usageTime = timeDifference * deviceCapacity;
                  totalUsageTime += usageTime;

                  let electricityCostTotal = 0;
  
                  if (usageTime >= 401) {
                    electricityCostTotal += (usageTime - 400) * 3015;
                    usageTime -= (usageTime - 400);
                    electricityCostTotal += (usageTime - 300) * 2919;
                    usageTime -= (usageTime - 300);
                    electricityCostTotal += (usageTime - 200) * 2612;
                    usageTime -= (usageTime - 200);
                    electricityCostTotal += (usageTime - 100) * 2074;
                    usageTime -= (usageTime - 100);
                    electricityCostTotal += (usageTime - 50) * 1786;
                    usageTime -= (usageTime - 50);
                    electricityCostTotal += usageTime * 1782;
                  } else if (usageTime >= 301) {
                    electricityCostTotal += (usageTime - 300) * 2919;
                    usageTime -= (usageTime - 300);
                    electricityCostTotal += (usageTime - 200) * 2612;
                    usageTime -= (usageTime - 200);
                    electricityCostTotal += (usageTime - 100) * 2074;
                    usageTime -= (usageTime - 100);
                    electricityCostTotal += (usageTime - 50) * 1786;
                    usageTime -= (usageTime - 50);
                    electricityCostTotal += usageTime * 1782;
                  } else if (usageTime >= 201) {
                    electricityCostTotal += (usageTime - 200) * 2612;
                    usageTime -= (usageTime - 200);
                    electricityCostTotal += (usageTime - 100) * 2074;
                    usageTime -= (usageTime - 100);
                    electricityCostTotal += (usageTime - 50) * 1786;
                    usageTime -= (usageTime - 50);
                    electricityCostTotal += usageTime * 1782;
                  } else if (usageTime >= 101) {
                    electricityCostTotal += (usageTime - 100) * 2074;
                    usageTime -= (usageTime - 100);
                    electricityCostTotal += (usageTime - 50) * 1786;
                    usageTime -= (usageTime - 50);
                    electricityCostTotal += usageTime * 1782;
                  } else if (usageTime >= 50) {
                    electricityCostTotal += (usageTime - 50) * 1786;
                    usageTime -= (usageTime - 50);
                    electricityCostTotal += usageTime * 1782;
                  }else{
                    electricityCostTotal += usageTime * 1782;
                  }
  
                  if (totalElectricityCostByDevice[deviceId]) {
                    totalElectricityCostByDevice[deviceId] += electricityCostTotal;
                  } else {
                    totalElectricityCostByDevice[deviceId] = electricityCostTotal;
                  }
  
                  totalElectricityCost += electricityCostTotal;
                  
                }
              }
            }
          }
        }
      }
  
      totalCost = totalElectricityCost;
  
      return res.status(200).json({
        success: 200,
        totalCost,
        kWh: totalUsageTime
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: 500,
        message: "Internal Server Error",
      });
    }
  }
  async  getTotalElectricityByPerMonth(req, res) {
    try {
      const { user_id } = req;
      const currentMonth = moment().tz("Asia/Ho_Chi_Minh").month() + 1;
      const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();
      const rooms = await Room.find({ userId: user_id });
      const sixMonthsAgo = moment().tz("Asia/Ho_Chi_Minh").subtract(5, 'months');
      const results = [];
  
      for (const room of rooms) {
        const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });
  
        for (const deviceRoomUser of deviceRoomUsers) {
          const timeUsedDevices = await TimeUsedDevice.find({ deviceInRoomId: deviceRoomUser._id });
  
          for (const timeUsedDevice of timeUsedDevices) {
            for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
              const dateOn = moment(timeUsedDevice.dateOn[i]).tz("Asia/Ho_Chi_Minh");
              const monthOn = dateOn.month() + 1;
              const yearOn = dateOn.year();
              const monthDiff = (currentYear - yearOn) * 12 + (currentMonth - monthOn);
  
              if (monthDiff <= 5 && dateOn >= sixMonthsAgo) {
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
  
      res.status(200).json(results);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  async getTotalElectricityByLast7Days(req, res) {
    try {
      const { user_id } = req;
      const rooms = await Room.find({ userId: user_id });
      const results = [];
      const currentDate = moment().tz("Asia/Ho_Chi_Minh").startOf('day');
  
      for (const room of rooms) {
        const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });
  
        for (const deviceRoomUser of deviceRoomUsers) {
          const timeUsedDevices = await TimeUsedDevice.find({ deviceInRoomId: deviceRoomUser._id });
  
          for (const timeUsedDevice of timeUsedDevices) {
            for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
              const dateOn = moment(timeUsedDevice.dateOn[i]).tz("Asia/Ho_Chi_Minh").startOf('day');
              const dateDiff = currentDate.diff(dateOn, 'days');
  
              if (dateDiff >= 0 && dateDiff < 7) {
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
  
                  let result = results.find(obj => obj.date === dateKey);
                  if (result) {
                    result.kWh += usageTime;
                    result.total += electricityCostTotal;
                  } else {
                    results.push({
                      date: dateKey,
                      kWh: usageTime,
                      total: electricityCostTotal
                    });
                  }
                }
              }
            }
          }
        }
      }

      for (let i = 6; i >= 0; i--) {
        const dateKey = currentDate.clone().subtract(i, 'days').format('YYYY-MM-DD');
        const existingResult = results.find(obj => obj.date === dateKey);
        if (!existingResult) {
          results.push({
            date: dateKey,
            kWh: 0,
            total: 0
          });
        }
      }
  
      res.status(200).json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  async getTotalElectricityBy30days(req, res) {
    try {
      const { user_id } = req;
      const rooms = await Room.find({ userId: user_id });
      const results = {};
  
      for (const room of rooms) {
        const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });
  
        for (const deviceRoomUser of deviceRoomUsers) {
          const timeUsedDevices = await TimeUsedDevice.find({ deviceInRoomId: deviceRoomUser._id });
  
          for (const timeUsedDevice of timeUsedDevices) {
            for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
              const dateOn = moment(timeUsedDevice.dateOn[i]).tz("Asia/Ho_Chi_Minh").startOf('day');
              const currentDate = moment().tz("Asia/Ho_Chi_Minh").startOf('day');
              const isCurrentMonth = dateOn.isSame(currentDate, 'month');
  
              if (isCurrentMonth && dateOn.isSameOrBefore(currentDate, 'day')) {
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
  
      const currentMonth = moment().tz("Asia/Ho_Chi_Minh").startOf('month');
      const lastDay = moment().tz("Asia/Ho_Chi_Minh").endOf('day').date();
      const dates = [];
      for (let i = 1; i <= lastDay; i++) {
        const date = currentMonth.clone().date(i).format('YYYY-MM-DD');
        dates.push(date);
      }
  
      const finalResults = dates.map(date => ({
        date,
        kWh: results[date]?.kWh || 0,
        total: results[date]?.total || 0
      }));
  
      res.status(200).json(finalResults);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new statisticController();
