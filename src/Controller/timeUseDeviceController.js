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
                const timeDifference = Math.min(dateOff.diff(dateOn, "hours"), 24);
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
      const monthlyData = [];
  
      for (const room of rooms) {
        const timeUsedDevices = await TimeUsedDevice.find({ roomId: room._id });
  
        const usageByMonth = {};
  
        for (const timeUsedDevice of timeUsedDevices) {
          for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
            const dateOn = moment(timeUsedDevice.dateOn[i]).tz(
              "Asia/Ho_Chi_Minh"
            );
            const dateOff = moment(timeUsedDevice.dateOff[i]).tz(
              "Asia/Ho_Chi_Minh"
            );
  
            const monthOn = dateOn.month() + 1;
            const yearOn = dateOn.year();
  
            if (
              yearOn < currentYear ||
              (yearOn === currentYear && monthOn <= currentMonth)
            ) {
              const dayOn = dateOn.date();
  
              if (!usageByMonth[monthOn]) {
                usageByMonth[monthOn] = {};
              }
  
              if (!usageByMonth[monthOn][dayOn]) {
                usageByMonth[monthOn][dayOn] = {};
              }
  
              let timeDifference = Math.min(
                dateOff.diff(dateOn, "hours"),
                24
              );
              if (dateOff.diff(dateOn, "hours") > 24) {
                const nextDay = dateOn.clone().add(1, "day");
                const monthOff = nextDay.month() + 1;
                const yearOff = nextDay.year();
                const dayOff = nextDay.date();
  
                const keyOff = `${monthOff}-${dayOff}-${yearOff}`;
  
                if (!usageByMonth[monthOff]) {
                  usageByMonth[monthOff] = {};
                }
  
                if (!usageByMonth[monthOff][dayOff]) {
                  usageByMonth[monthOff][dayOff] = {};
                }
  
                const timeDifferenceOffNextDay = dateOff
                  .hours(0)
                  .diff(dateOff, "hours");
                usageByMonth[monthOn][dayOn][timeUsedDevice.deviceId] =
                  24 - timeDifference;
                usageByMonth[monthOff][dayOff][timeUsedDevice.deviceId] =
                  timeDifferenceOffNextDay;
              } else {
                if (!usageByMonth[monthOn][dayOn][timeUsedDevice.deviceId]) {
                  usageByMonth[monthOn][dayOn][timeUsedDevice.deviceId] = 0;
                }
                usageByMonth[monthOn][dayOn][timeUsedDevice.deviceId] +=
                  timeDifference;
              }
            }
          }
        }
  
        for (const month in usageByMonth) {
          for (const day in usageByMonth[month]) {
            for (const deviceId in usageByMonth[month][day]) {
              const usageTime = usageByMonth[month][day][deviceId];
              const device = await Device.findById(deviceId);
              if (device) {
                let electricityCost = usageTime * device.capacity;
                let electricityCostTotal = 0;
  
                if (electricityCost >= 401) {
                  electricityCostTotal += (electricityCost - 400) * 3015;
                } else if (electricityCost >= 301) {
                  electricityCostTotal += (electricityCost - 301) * 2919;
                } else if (electricityCost >= 201) {
                  electricityCostTotal += (electricityCost - 201) * 2612;
                } else if (electricityCost >= 101) {
                  electricityCostTotal += (electricityCost - 101) * 2074;
                } else if (electricityCost >= 51) {
                  electricityCostTotal += (electricityCost - 50) * 1786;
                }else{
                  electricityCostTotal += electricityCost* 1782

                }
  
                const monthData = monthlyData.find(
                  (data) =>
                    data.month === parseInt(month) && data.year === currentYear
                );
  
                if (monthData) {
                  monthData.totalElectricity += usageTime;
                  monthData.totalCost += electricityCost;
                } else {
                  monthlyData.push({
                    month: parseInt(month),
                    year: currentYear,
                    kWh: electricityCost,
                    totalCost: electricityCostTotal,
                
                  });
                }
              }
            }
          }
        }
      }
  
      
    
      res.status(200).json(monthlyData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async  getTotalElectricityByLast7Days(req, res) {
    try {
      const { user_id } = req;
      const currentMonth = moment().tz("Asia/Ho_Chi_Minh").month() + 1;
      const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();
      const sevenDaysAgo = moment().tz("Asia/Ho_Chi_Minh").subtract(6, "days");
    
      const rooms = await Room.find({ userId: user_id });
      const weeklyData = [];
    
      for (const room of rooms) {
        const timeUsedDevices = await TimeUsedDevice.find({ roomId: room._id });
    
        const usageByDay = {};
    
        for (const timeUsedDevice of timeUsedDevices) {
          for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
            const dateOn = moment(timeUsedDevice.dateOn[i]).tz("Asia/Ho_Chi_Minh");
            const dateOff = moment(timeUsedDevice.dateOff[i]).tz("Asia/Ho_Chi_Minh");
    
            if (dateOn.isBetween(sevenDaysAgo, moment(), undefined, '[]')) {
              const day = dateOn.format("YYYY-MM-DD");
    
              if (!usageByDay[day]) {
                usageByDay[day] = {};
              }
    
              let timeDifference = Math.min(dateOff.diff(dateOn, "hours"), 24);
              if (dateOff.diff(dateOn, "hours") > 24) {
                const nextDay = dateOn.clone().add(1, "day");
                const nextDayKey = nextDay.format("YYYY-MM-DD");
    
                if (!usageByDay[nextDayKey]) {
                  usageByDay[nextDayKey] = {};
                }
    
                const timeDifferenceOffNextDay = dateOff.hours(0).diff(dateOff, "hours");
                usageByDay[day][timeUsedDevice.deviceId] = 24 - timeDifference;
                usageByDay[nextDayKey][timeUsedDevice.deviceId] = timeDifferenceOffNextDay;
              } else {
                if (!usageByDay[day][timeUsedDevice.deviceId]) {
                  usageByDay[day][timeUsedDevice.deviceId] = 0;
                }
                usageByDay[day][timeUsedDevice.deviceId] += timeDifference;
              }
            }
          }
        }
    
        for (const day in usageByDay) {
          for (const deviceId in usageByDay[day]) {
            const usageTime = usageByDay[day][deviceId];
            const device = await Device.findById(deviceId);
    
            if (device) {
              let electricityCost = usageTime * device.capacity;
              let electricityCostTotal = 0;
    
              if (electricityCost >= 401) {
                electricityCostTotal += (electricityCost - 400) * 3015;
              } else if (electricityCost >= 301) {
                electricityCostTotal += (electricityCost - 301) * 2919;
              } else if (electricityCost >= 201) {
                electricityCostTotal += (electricityCost - 201) * 2612;
              } else if (electricityCost >= 101) {
                electricityCostTotal += (electricityCost - 101) * 2074;
              } else if (electricityCost >= 51) {
                electricityCostTotal += (electricityCost - 50) * 1786;
              } else {
                electricityCostTotal += electricityCost * 1782;
              }
    
              const dayData = weeklyData.find(data => data.day === day);
    
              if (dayData) {
                dayData.totalElectricity += usageTime;
                dayData.totalCost += electricityCostTotal;
              } else {
                weeklyData.push({
                  day: day,
                  totalElectricity: usageTime,
                  totalCost: electricityCostTotal
                });
              }
            }
          }
        }
      }
    
      res.status(200).json(weeklyData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = new statisticController();
