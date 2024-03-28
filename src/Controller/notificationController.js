const admin = require('firebase-admin');
const moment = require('moment-timezone');
const TimeUsedDevice = require('../Models/timeUseDeviceModels');
const DeviceRoomUser = require('../Models/deviceRoomUserModels');
const Room = require('../Models/roomModels');
const Tips = require('../Models/tipModels');
const User = require('../Models/userModels');
const serviceAccount = require('../firebase/serviceAccountKeys.json');
const Device = require('../Models/deviceModels');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


async function sendPushNotification(deviceToken, title, message) {
  const { messaging } = admin;


  try {
    await messaging().sendToDevice(deviceToken, {
      notification: {
        title: title,
        body: message
      }
    });
    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
  async function CompareByWeek() {
    try {
      const users = await User.find();
      const currentWeek = moment().tz('Asia/Ho_Chi_Minh').week();
      const previousWeek = currentWeek - 1;
      const currentYear = moment().tz('Asia/Ho_Chi_Minh').year();
      const results = [];
      const processedUsers = new Set(); // Track processed users
  
      for (const user of users) {
        if (processedUsers.has(user._id)) {
          continue; // Skip processing if user has already been processed
        }
  
        const rooms = await Room.find({ userId: user._id });
  
        for (const room of rooms) {
          const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });
  
          for (const deviceRoomUser of deviceRoomUsers) {
          const timeUsedDevices = await TimeUsedDevice.find({
            deviceInRoomId: deviceRoomUser._id
          });
   
          for (const timeUsedDevice of timeUsedDevices) {
            for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
              const dateOn = moment(timeUsedDevice.dateOn[i]).tz('Asia/Ho_Chi_Minh');
              const weekOn = dateOn.week();
              const yearOn = dateOn.year();
   
              if (weekOn === currentWeek && yearOn === currentYear) {
                const dateOff = moment(timeUsedDevice.dateOff[i]).tz('Asia/Ho_Chi_Minh');
                const timeDifferenceMinutes = dateOff.diff(dateOn, 'minutes');
           
                const usageMinutes = timeDifferenceMinutes % 60;
                const usageHours = Math.floor(timeDifferenceMinutes / 60);
                const TotalHours = Math.floor(timeDifferenceMinutes / 60) + usageMinutes / 60;
                const deviceRoomUserPopulated = await DeviceRoomUser.findById(deviceRoomUser._id).populate('deviceId');
   
                if (deviceRoomUserPopulated) {
                  const deviceId = deviceRoomUserPopulated.deviceId._id;
                  const deviceCapacity = deviceRoomUserPopulated.deviceId.capacity || 0;
                  const usageTime = TotalHours * deviceCapacity;
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
   
                  let tipMessage = '';
                  if (weekOn > previousWeek) {
                    const previousElectricityCostTotal = await calculatePreviousElectricityCost(user._id, previousWeek, currentYear);
                    const costIncrease = electricityCostTotal - previousElectricityCostTotal;
                    tipMessage = `Your electricity usage for this week is ${usageHours} hours ${usageMinutes} minutes, costing ${electricityCostTotal.toFixed(2)} VND. Compared to last week, your usage increased by ${costIncrease.toFixed(2)} VND.`;
                  } else if (weekOn < previousWeek) {
                    const previousElectricityCostTotal = await calculatePreviousElectricityCost(user._id, previousWeek, currentYear);
                    const costSaving = previousElectricityCostTotal - electricityCostTotal;
                    tipMessage = `Your electricity cost for this week is ${electricityCostTotal.toFixed(2)} VND. You have saved ${costSaving.toFixed(2)} VND compared to last week.`;
                  } else {
                    tipMessage = `Your electricity cost remains the same as last week.`;
                  }
                  console.log(tipMessage);
                  const newTip = new Tips({
                    title: 'Electricity Usage',
                    content: tipMessage,
                    userId: user._id
                  });
   
                  await newTip.save();
                  results.push(newTip);
                  console.log(user.token);
                  await sendPushNotification(user.token, newTip.title, newTip.content);
                }
              }
            }
          }
        }
      }
    }    
    return results;
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
  }
}
async function CompareByUsage() {
  try {
    const currentDate = moment().tz("Asia/Ho_Chi_Minh").startOf("day");
    const users = await User.find({});


    for (const user of users) {
      const userId = user._id;
      const rooms = await Room.find({userId});
      for (const room of rooms) {
        const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });


        for (const deviceRoomUser of deviceRoomUsers) {
          const device = await Device.findById(deviceRoomUser.deviceId);


          if (!device) {
            console.log(`Device not found for deviceRoomUser: ${deviceRoomUser._id}`);
            continue;
          }


          const timeUsedDevices = await TimeUsedDevice.find({ deviceInRoomId: deviceRoomUser._id });


          let totalUsageTime = 0;


          for (const timeUsedDevice of timeUsedDevices) {
            const { dateOn, dateOff } = timeUsedDevice;


            for (let i = 0; i < dateOn.length; i++) {
              const deviceUsageDate = moment(dateOn[i]).tz("Asia/Ho_Chi_Minh");


              if (deviceUsageDate.isSame(currentDate, "day")) {
                const deviceOffDate = moment(dateOff[i]).tz("Asia/Ho_Chi_Minh");
                const deviceUsageTime = deviceOffDate.diff(deviceUsageDate, "hours");
                const timeDifferenceMinutes = deviceOffDate.diff(deviceUsageDate, "minutes") % 60;
                totalUsageTime += deviceUsageTime + timeDifferenceMinutes/60;
              }
            }
          }
          if (totalUsageTime > deviceRoomUser.timeUsed) {
            const deviceName = device.name;
            const UsageTime = totalUsageTime -deviceRoomUser.timeUsed
            const notificationMessage = `Device ${deviceName} has been used ${totalUsageTime.toFixed(2)} beyond the normal usage time of ${UsageTime.toFixed(2)} hour`;
          console.log(notificationMessage);
            const newTip = new Tips({
              title: 'Warning about the time of using electrical equipment',
              content: notificationMessage,
              userId: user._id
            });


            await newTip.save();


            await sendPushNotification(user.token, "Warning about the time of using electrical equipment", notificationMessage);


            deviceRoomUser.timeUsed = totalUsageTime;
            await deviceRoomUser.save();
            totalUsageTime=0
          }
        }
      }
    }


    console.log("Comparison completed.");


  } catch (error) {
    console.error("Error:", error);
  }
}
async function CompareByMonth() {
  try {
    const currentMonth = moment().tz("Asia/Ho_Chi_Minh").month() + 1;
    const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();
    const users = await User.find({});


    for (const user of users) {
      const userRooms = await Room.find({ userId: user._id });
      const results = [];


      for (const room of userRooms) {
        const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });
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
                const timeDifferenceInMinutes = dateOff.diff(dateOn, "minutes");
                const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
                const deviceRoomUserPopulated = await DeviceRoomUser.findById(deviceRoomUser._id).populate('deviceId');


                if (deviceRoomUserPopulated) {
                  const deviceId = deviceRoomUserPopulated.deviceId._id;
                  const deviceCapacity = deviceRoomUserPopulated.deviceId.capacity || 0;
                  const usageTime = timeDifferenceInHours * deviceCapacity;
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


      if (results.length >= 2) {
        const sortedResults = results.sort((a, b) => moment(b.month, "MMMM YYYY").diff(moment(a.month, "MMMM YYYY")));
        const currentMonthData = sortedResults[0];
        const previousMonthData = sortedResults[1];


        const currentMonthUsage = currentMonthData.totalElectricityCost;
        const previousMonthUsage = previousMonthData.totalElectricityCost;


        const electricityDifference = currentMonthUsage - previousMonthUsage;


        let message = "";
        if (electricityDifference > 0) {
          const extraSpending = Math.abs(electricityDifference).toFixed(2);
          message = `In ${currentMonthData.month}, your electricity usage increased by ${extraSpending} VnĐ compared to the previous month. Please consider reducing your usage. You spent an extra ${extraSpending} VnĐ compared to the previous month.`;
       } else if (electricityDifference < 0) {
          const savings = Math.abs(electricityDifference).toFixed(2);
          message = `In ${currentMonthData.month}, you saved ${savings} VnĐ of electricity compared to the previous month. Keep up the good work!`;
        } else {
          message = `In ${currentMonthData.month}, your electricity usage remained the same as the previous month.`;
        }


        const newTip = new Tips({
          title: 'Electricity Usage',
          content: message,
          userId: user._id
        });
        await newTip.save();


        console.log(user.token);
        await sendPushNotification(user.token, newTip.title, newTip.content);
      }
    }


    console.log('Push notifications sent successfully');
  } catch (error) {
    console.error("Error:", error);
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
      const user = await User.findById(savedTips.userId);
      if (user && user.token) {
        await sendPushNotification(user.token, savedTips.title, savedTips.content);
      }
    });


    await Promise.all(pushTipsPromises);


    console.log("Push notifications sent successfully.");


    res.status(200).json({
      code: 200,
      message: 'success',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
}
let trueRecords = [];
async function checkAndUpdateIsStatus() {
  try {
    const currentDate = moment().utcOffset('+07:00');
    if (currentDate.hour() === 23 && currentDate.minute() === 59) {
      await DeviceRoomUser.updateMany({ isStatus: true }, { isStatus: false });
      trueRecords = await DeviceRoomUser.find({ isStatus: true });
      console.log('updated isStatus: true -> false at 23:59');
      return true;
    }


 
    if (currentDate.hour() === 0 && currentDate.minute() === 0) {
      const recordIds = trueRecords.map(record => record._id);
      await DeviceRoomUser.updateMany({ _id: { $in: recordIds } }, { isStatus: true });
      trueRecords.splice(0, trueRecords.length); // Đặt lại mảng trueRecords thành rỗng
      console.log('updated isStatus: false -> true in new day');
      return true;
    }


    return false;
  } catch (error) {
    console.error('Error:', error);
  }
}
async function calculatePreviousElectricityCost(userId, previousWeek, currentYear) {
  const rooms = await Room.find({ userId: userId });
  let previousElectricityCostTotal = 0;


  for (const room of rooms) {
    const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });


    for (const deviceRoomUser of deviceRoomUsers) {
      const timeUsedDevices = await TimeUsedDevice.find({
        deviceInRoomId: deviceRoomUser._id
      });


      for (const timeUsedDevice of timeUsedDevices) {
        for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
          const dateOn = moment(timeUsedDevice.dateOn[i]).tz('Asia/Ho_Chi_Minh');
          const weekOn = dateOn.week();
          const yearOn = dateOn.year();


          if (weekOn === previousWeek && yearOn === currentYear) {
            const dateOff = moment(timeUsedDevice.dateOff[i]).tz('Asia/Ho_Chi_Minh');
            const timeDifferenceMinutes = dateOff.diff(dateOn, 'minutes');
       
            const usageMinutes = timeDifferenceMinutes % 60;
            const usageHours = Math.floor(timeDifferenceMinutes / 60);
            const TotalHours = Math.floor(timeDifferenceMinutes / 60) + usageMinutes / 60;
            const deviceRoomUserPopulated = await DeviceRoomUser.findById(deviceRoomUser._id).populate('deviceId');


            if (deviceRoomUserPopulated) {
              const deviceId = deviceRoomUserPopulated.deviceId._id;
              const deviceCapacity = deviceRoomUserPopulated.deviceId.capacity || 0;
              const usageTime = TotalHours * deviceCapacity;
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


              previousElectricityCostTotal += electricityCostTotal;
            }
          }
        }
      }
    }
  }


  return previousElectricityCostTotal;
}
module.exports = {
  CompareByWeek,
  CompareByMonth,
  addTips,
  CompareByUsage,
  checkAndUpdateIsStatus,
  calculatePreviousElectricityCost
};


