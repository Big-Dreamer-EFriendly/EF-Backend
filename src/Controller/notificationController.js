const admin = require("firebase-admin");
const moment = require("moment-timezone");
const TimeUsedDevice = require("../Models/timeUseDeviceModels");
const DeviceRoomUser = require("../Models/deviceRoomUserModels");
const Room = require("../Models/roomModels");
const Tips = require("../Models/tipModels");
const User = require("../Models/userModels");
const serviceAccount = require("../firebase/serviceAccountKeys.json");
const Device = require("../Models/deviceModels");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
async function sendPushNotification(deviceToken, title, message) {
  const { messaging } = admin;

  try {
    await messaging().sendToDevice(deviceToken, {
      notification: {
        title: title,
        body: message,
      },
    });
    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}
async function CompareByWeek() {
  try {
    const currentWeek = moment().tz("Asia/Ho_Chi_Minh").week();
    const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();
    const users = await User.find({});

    for (const user of users) {
      const userRooms = await Room.find({ userId: user._id });
      const results = [];

      for (const room of userRooms) {
        const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });

        for (const deviceRoomUser of deviceRoomUsers) {
          const timeUsedDevices = await TimeUsedDevice.find({
            deviceInRoomId: deviceRoomUser._id,
          });

          for (const timeUsedDevice of timeUsedDevices) {
            for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
              const dateOn = moment(timeUsedDevice.dateOn[i]).tz(
                "Asia/Ho_Chi_Minh"
              );
              const weekOn = dateOn.week();
              const yearOn = dateOn.year();
              const weekDiff =
                (currentYear - yearOn) * 52 + (currentWeek - weekOn);

              if (weekDiff <= 1) {
                // Chỉ xem xét dữ liệu trong 2 tuần gần nhất
                const dateOff = moment(timeUsedDevice.dateOff[i]).tz(
                  "Asia/Ho_Chi_Minh"
                );
                const timeDifferenceInMinutes = dateOff.diff(dateOn, "minutes");
                const timeDifferenceInHours = Math.floor(
                  timeDifferenceInMinutes / 60
                );
                const deviceRoomUserPopulated = await DeviceRoomUser.findById(
                  deviceRoomUser._id
                ).populate("deviceId");

                if (deviceRoomUserPopulated) {
                  const deviceId = deviceRoomUserPopulated.deviceId._id;
                  const deviceCapacity =
                    deviceRoomUserPopulated.deviceId.capacity || 0;
                  const usageTime = timeDifferenceInHours * deviceCapacity;
                  let electricityCostTotal = 0;

                  if (usageTime >= 401) {
                    electricityCostTotal +=
                      (usageTime - 400) * 3015 +
                      300 * 2919 +
                      200 * 2612 +
                      100 * 2074 +
                      50 * 1786 +
                      50 * 1782;
                  } else if (usageTime >= 301) {
                    electricityCostTotal +=
                      (usageTime - 300) * 2919 +
                      200 * 2612 +
                      100 * 2074 +
                      50 * 1786 +
                      50 * 1782;
                  } else if (usageTime >= 201) {
                    electricityCostTotal +=
                      (usageTime - 200) * 2612 +
                      100 * 2074 +
                      50 * 1786 +
                      50 * 1782;
                  } else if (usageTime >= 101) {
                    electricityCostTotal +=
                      (usageTime - 100) * 2074 + 50 * 1786 + 50 * 1782;
                  } else if (usageTime >= 51) {
                    electricityCostTotal += (usageTime - 50) * 1786 + 50 * 1782;
                  } else {
                    electricityCostTotal += usageTime * 1782;
                  }

                  const weekYear = dateOn.format("wo YYYY");
                  const index = results.findIndex(
                    (result) => result.week === weekYear
                  );
                  if (index !== -1) {
                    results[index].totalElectricityCost += electricityCostTotal;
                    results[index].totalUsageTime += usageTime;
                  } else {
                    results.push({
                      week: weekYear,
                      totalElectricityCost: electricityCostTotal,
                      totalUsageTime: usageTime,
                    });
                  }
                }
              }
            }
          }
        }
      }

      if (results.length >= 2) {
        const sortedResults = results.sort((a, b) =>
          moment(a.week, "wo YYYY").diff(moment(b.week, "wo YYYY"))
        );
        const currentWeekData = sortedResults[sortedResults.length - 1];
        const previousWeekData = sortedResults[sortedResults.length - 2];

        const currentWeekUsage = currentWeekData.totalElectricityCost.toFixed(2);
        const previousWeekUsage = previousWeekData.totalElectricityCost;

        const electricityDifference = currentWeekUsage - previousWeekUsage;

        let message = "";
        if (electricityDifference > 0) {
          const extraSpending = Math.abs(electricityDifference).toFixed(2);
          message = `We would like to send you information about your electricity consumption over the past week. This is an important warning about your electricity usage and important changes to your energy bill.

We would like to inform you that your electricity usage this week has increased significantly compared to last week. According to the report, your total electricity cost this week is  ${currentWeekUsage} VND. This represents a significant increase compared to last week, with an increase of up to ${extraSpending} VND.

We would like to remind you that saving electricity not only helps reduce costs but also plays an important role in protecting the environment. Here are some measures you can take to reduce your electricity use:

- Turn Off Unused Appliances: Make sure all electrical appliances in the home are turned off when not in use, including lights, fans and other electrical appliances.

- Use Energy-Efficient Appliances: If possible, consider using energy-efficient electrical appliances such as LED lights and refrigerators with high energy labels.`;
        } else if (electricityDifference < 0) {
          const savings = Math.abs(electricityDifference).toFixed(2);
          message = `In ${currentWeekUsage.month}, you saved ${savings} VnĐ of electricity compared to the previous month. Keep up the good work!`;
        } else {
          message = `In ${currentWeekUsage.month}, your electricity usage remained the same as the previous month.`;
        }

        const newTip = new Tips({
          title: "Warning of increased electricity use by week",
          content: message,
          userId: user._id,
        });
        await newTip.save();

        console.log(user.token);
        await sendPushNotification(user.token, newTip.title, newTip.content);
      }
    }

    console.log("Push notifications sent successfully");
  } catch (error) {
    console.error("Error:", error);
  }
}
async function calculatePreviousElectricityCost(userId, week, year) {
  let totalElectricityCost = 0;

  const user = await User.findById(userId);
  const rooms = await Room.find({ userId: userId });

  for (const room of rooms) {
    const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });

    for (const deviceRoomUser of deviceRoomUsers) {
      const timeUsedDevices = await TimeUsedDevice.find({
        deviceInRoomId: deviceRoomUser._id,
      });

      for (const timeUsedDevice of timeUsedDevices) {
        for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
          const dateOn = moment(timeUsedDevice.dateOn[i]).tz(
            "Asia/Ho_Chi_Minh"
          );
          const weekOn = dateOn.week();
          const yearOn = dateOn.year();

          if (weekOn === week && yearOn === year) {
            const dateOff = moment(timeUsedDevice.dateOff[i]).tz(
              "Asia/Ho_Chi_Minh"
            );
            const timeDifferenceMinutes = dateOff.diff(dateOn, "minutes");

            const usageMinutes = timeDifferenceMinutes % 60;
            const usageHours = Math.floor(timeDifferenceMinutes / 60);
            const TotalHours =
              Math.floor(timeDifferenceMinutes / 60) + usageMinutes / 60;
            const deviceRoomUserPopulated = await DeviceRoomUser.findById(
              deviceRoomUser._id
            ).populate("deviceId");

            if (deviceRoomUserPopulated) {
              const deviceId = deviceRoomUserPopulated.deviceId._id;
              const deviceCapacity =
                deviceRoomUserPopulated.deviceId.capacity || 0;
              const usageTime = TotalHours * deviceCapacity;
              let electricityCostTotal = 0;

              if (usageTime >= 401) {
                electricityCostTotal +=
                  (usageTime - 400) * 3015 +
                  300 * 2919 +
                  200 * 2612 +
                  100 * 2074 +
                  50 * 1786 +
                  50 * 1782;
              } else if (usageTime >= 301) {
                electricityCostTotal +=
                  (usageTime - 300) * 2919 +
                  200 * 2612 +
                  100 * 2074 +
                  50 * 1786 +
                  50 * 1782;
              } else if (usageTime >= 201) {
                electricityCostTotal +=
                  (usageTime - 200) * 2612 + 100 * 2074 + 50 * 1786 + 50 * 1782;
              } else if (usageTime >= 101) {
                electricityCostTotal +=
                  (usageTime - 100) * 2074 + 50 * 1786 + 50 * 1782;
              } else if (usageTime >= 51) {
                electricityCostTotal += (usageTime - 50) * 1786 + 50 * 1782;
              } else {
                electricityCostTotal += usageTime * 1782;
              }

              totalElectricityCost += electricityCostTotal;
            }
          }
        }
      }
    }
  }

  return totalElectricityCost;
}
async function CompareByUsage() {
  try {
    const currentDate = moment().tz("Asia/Ho_Chi_Minh").startOf("day");
    const users = await User.find({});

    for (const user of users) {
      const userId = user._id;
      const rooms = await Room.find({ userId });
      for (const room of rooms) {
        const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });

        for (const deviceRoomUser of deviceRoomUsers) {
          const device = await Device.findById(deviceRoomUser.deviceId);

          if (!device) {
            console.log(
              `Device not found for deviceRoomUser: ${deviceRoomUser._id}`
            );
            continue;
          }

          const timeUsedDevices = await TimeUsedDevice.find({
            deviceInRoomId: deviceRoomUser._id,
          });

          let totalUsageTime = 0;

          for (const timeUsedDevice of timeUsedDevices) {
            const { dateOn, dateOff } = timeUsedDevice;

            for (let i = 0; i < dateOn.length; i++) {
              const deviceUsageDate = moment(dateOn[i]).tz("Asia/Ho_Chi_Minh");

              if (deviceUsageDate.isSame(currentDate, "day")) {
                const deviceOffDate = moment(dateOff[i]).tz("Asia/Ho_Chi_Minh");
                const deviceUsageTime = deviceOffDate.diff(
                  deviceUsageDate,
                  "hours"
                );
                const timeDifferenceMinutes =
                  deviceOffDate.diff(deviceUsageDate, "minutes") % 60;
                totalUsageTime += deviceUsageTime + timeDifferenceMinutes / 60;
              }
            }
          }
          if (totalUsageTime > deviceRoomUser.timeUsed) {
            const deviceName = device.name;

            const UsageTime = totalUsageTime - deviceRoomUser.timeUsed;
            const notificationMessage = `We would like to inform you that the device ${deviceName} has been used longer than the normal usage period. 
As of now, the total usage time is ${totalUsageTime.toFixed(2)} hours, which exceeds the expected time of ${UsageTime.toFixed(2)} hours.
Use beyond the expected time may cause problems such as rapid wear or failure. 
It is recommended to inspect the equipment and determine whether maintenance or repairs need to be performed. 
If you have any questions or need additional assistance, please contact us. Thank you for carefully monitoring and managing device usage.`;

            const newTip = new Tips({
              title: "Device Used Beyond Normal Time",
              content: notificationMessage,
              userId: user._id,
            });

            await newTip.save();

            await sendPushNotification(
              user.token,
              "Device Used Beyond Normal Time",
              notificationMessage
            );

            deviceRoomUser.timeUsed = totalUsageTime;
            await deviceRoomUser.save();
            totalUsageTime = 0;
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
          const timeUsedDevices = await TimeUsedDevice.find({
            deviceInRoomId: deviceRoomUser._id,
          });

          for (const timeUsedDevice of timeUsedDevices) {
            for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
              const dateOn = moment(timeUsedDevice.dateOn[i]).tz(
                "Asia/Ho_Chi_Minh"
              );
              const monthOn = dateOn.month() + 1;
              const yearOn = dateOn.year();
              const monthDiff =
                (currentYear - yearOn) * 12 + (currentMonth - monthOn);

              if (monthDiff <= 1) {
                // Only consider data from the last two months
                const dateOff = moment(timeUsedDevice.dateOff[i]).tz(
                  "Asia/Ho_Chi_Minh"
                );
                const timeDifferenceInMinutes = dateOff.diff(dateOn, "minutes");
                const timeDifferenceInHours = Math.floor(
                  timeDifferenceInMinutes / 60
                );
                const deviceRoomUserPopulated = await DeviceRoomUser.findById(
                  deviceRoomUser._id
                ).populate("deviceId");

                if (deviceRoomUserPopulated) {
                  const deviceId = deviceRoomUserPopulated.deviceId._id;
                  const deviceCapacity =
                    deviceRoomUserPopulated.deviceId.capacity || 0;
                  const usageTime = timeDifferenceInHours * deviceCapacity;
                  let electricityCostTotal = 0;

                  if (usageTime >= 401) {
                    electricityCostTotal +=
                      (usageTime - 400) * 3015 +
                      300 * 2919 +
                      200 * 2612 +
                      100 * 2074 +
                      50 * 1786 +
                      50 * 1782;
                  } else if (usageTime >= 301) {
                    electricityCostTotal +=
                      (usageTime - 300) * 2919 +
                      200 * 2612 +
                      100 * 2074 +
                      50 * 1786 +
                      50 * 1782;
                  } else if (usageTime >= 201) {
                    electricityCostTotal +=
                      (usageTime - 200) * 2612 +
                      100 * 2074 +
                      50 * 1786 +
                      50 * 1782;
                  } else if (usageTime >= 101) {
                    electricityCostTotal +=
                      (usageTime - 100) * 2074 + 50 * 1786 + 50 * 1782;
                  } else if (usageTime >= 51) {
                    electricityCostTotal += (usageTime - 50) * 1786 + 50 * 1782;
                  } else {
                    electricityCostTotal += usageTime * 1782;
                  }

                  const monthYear = dateOn.format("MMMM YYYY");
                  const index = results.findIndex(
                    (result) => result.month === monthYear
                  );
                  if (index !== -1) {
                    results[index].totalElectricityCost += electricityCostTotal;
                    results[index].totalUsageTime += usageTime;
                  } else {
                    results.push({
                      month: monthYear,
                      totalElectricityCost: electricityCostTotal,
                      totalUsageTime: usageTime,
                    });
                  }
                }
              }
            }
          }
        }
      }

      if (results.length >= 2) {
        const sortedResults = results.sort((a, b) =>
          moment(b.month, "MMMM YYYY").diff(moment(a.month, "MMMM YYYY"))
        );
        const currentMonthData = sortedResults[0];
        const previousMonthData = sortedResults[1];

        const currentMonthUsage = currentMonthData.totalElectricityCost;
        const previousMonthUsage = previousMonthData.totalElectricityCost;

        const electricityDifference = currentMonthUsage - previousMonthUsage;

        let message = "";
        if (electricityDifference > 0) {
          const extraSpending = Math.abs(electricityDifference).toFixed(2);
          message = `Dear Customer,
We're sending you an important announcement about your electricity usage during the month ${currentMonthData.month}. 
This is a warning about cost increases compared to last month and the need to reduce electricity usage.
During the month ${currentMonthData.month}, your electricity costs increased by ${extraSpending} VND compared to the previous month. 
This represents a significant increase in your electricity bill. 
We recommend that you consider reducing your electricity usage to avoid unnecessary costs in the future`;
        } else if (electricityDifference < 0) {
          const savings = Math.abs(electricityDifference).toFixed(2);
          message = `In ${currentMonthData.month}, you saved ${savings} VnĐ of electricity compared to the previous month. Keep up the good work!`;
        } else {
          message = `In ${currentMonthData.month}, your electricity usage remained the same as the previous month.`;
        }

        const newTip = new Tips({
          title: "Electricity Usage",
          content: message,
          userId: user._id,
        });
        await newTip.save();

        console.log(user.token);
        await sendPushNotification(user.token, newTip.title, newTip.content);
      }
    }

    console.log("Push notifications sent successfully");
  } catch (error) {
    console.error("Error:", error);
  }
}
async function addTips(req, res) {
  try {
    const { title, content } = req.body;
    const allUsers = await User.find();
    const userIds = allUsers.map((user) => user._id);
    const pushTipsPromises = userIds.map(async (userId) => {
      const newTips = new Tips({
        title,
        content,
        userId: userId,
      });
      const savedTips = await newTips.save();
      const user = await User.findById(savedTips.userId);
      if (user && user.token) {
        await sendPushNotification(
          user.token,
          savedTips.title,
          savedTips.content
        );
      }
    });

    await Promise.all(pushTipsPromises);

    console.log("Push notifications sent successfully.");

    res.status(200).json({
      code: 200,
      message: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
}
let trueRecords = [];
async function checkAndUpdateIsStatus() {
  try {
    const currentDate = moment().utcOffset("+07:00");
    if (currentDate.hour() === 23 && currentDate.minute() === 59) {
      await DeviceRoomUser.updateMany({ isStatus: true }, { isStatus: false });
      trueRecords = await DeviceRoomUser.find({ isStatus: true });
      console.log("updated isStatus: true -> false at 23:59");
      return true;
    }

    if (currentDate.hour() === 0 && currentDate.minute() === 0) {
      const recordIds = trueRecords.map((record) => record._id);
      await DeviceRoomUser.updateMany(
        { _id: { $in: recordIds } },
        { isStatus: true }
      );
      trueRecords.splice(0, trueRecords.length); // Đặt lại mảng trueRecords thành rỗng
      console.log("updated isStatus: false -> true in new day");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error:", error);
  }
}
async function calculatePreviousElectricityCost(
  userId,
  previousWeek,
  currentYear
) {
  const rooms = await Room.find({ userId: userId });
  let previousElectricityCostTotal = 0;

  for (const room of rooms) {
    const deviceRoomUsers = await DeviceRoomUser.find({ roomId: room._id });

    for (const deviceRoomUser of deviceRoomUsers) {
      const timeUsedDevices = await TimeUsedDevice.find({
        deviceInRoomId: deviceRoomUser._id,
      });

      for (const timeUsedDevice of timeUsedDevices) {
        for (let i = 0; i < timeUsedDevice.dateOn.length; i++) {
          const dateOn = moment(timeUsedDevice.dateOn[i]).tz(
            "Asia/Ho_Chi_Minh"
          );
          const weekOn = dateOn.week();
          const yearOn = dateOn.year();

          if (weekOn === previousWeek && yearOn === currentYear) {
            const dateOff = moment(timeUsedDevice.dateOff[i]).tz(
              "Asia/Ho_Chi_Minh"
            );
            const timeDifferenceMinutes = dateOff.diff(dateOn, "minutes");

            const usageMinutes = timeDifferenceMinutes % 60;
            const usageHours = Math.floor(timeDifferenceMinutes / 60);
            const TotalHours =
              Math.floor(timeDifferenceMinutes / 60) + usageMinutes / 60;
            const deviceRoomUserPopulated = await DeviceRoomUser.findById(
              deviceRoomUser._id
            ).populate("deviceId");

            if (deviceRoomUserPopulated) {
              const deviceId = deviceRoomUserPopulated.deviceId._id;
              const deviceCapacity =
                deviceRoomUserPopulated.deviceId.capacity || 0;
              const usageTime = TotalHours * deviceCapacity;
              let electricityCostTotal = 0;

              if (usageTime >= 401) {
                electricityCostTotal +=
                  (usageTime - 400) * 3015 +
                  300 * 2919 +
                  200 * 2612 +
                  100 * 2074 +
                  50 * 1786 +
                  50 * 1782;
              } else if (usageTime >= 301) {
                electricityCostTotal +=
                  (usageTime - 300) * 2919 +
                  200 * 2612 +
                  100 * 2074 +
                  50 * 1786 +
                  50 * 1782;
              } else if (usageTime >= 201) {
                electricityCostTotal +=
                  (usageTime - 200) * 2612 + 100 * 2074 + 50 * 1786 + 50 * 1782;
              } else if (usageTime >= 101) {
                electricityCostTotal +=
                  (usageTime - 100) * 2074 + 50 * 1786 + 50 * 1782;
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
  calculatePreviousElectricityCost,
};
