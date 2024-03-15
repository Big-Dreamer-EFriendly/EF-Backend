const moment = require("moment-timezone");
const TimeUsedDevice = require("../Models/timeUseDeviceModels");
const UsageTimeModel = require("../Models/usageTimeModels");
const Device = require("../Models/deviceModels");
const Room = require("../Models/roomModels");
class statisticController {
  async getTotalUsageTimeByMonth(req, res) {
    try {
      const { roomId } = req.body;
      const currentMonth = moment().tz("Asia/Ho_Chi_Minh").month() + 1;
      const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();

      const timeUsedDevices = await TimeUsedDevice.find({ roomId });

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

          if (monthOn === currentMonth && yearOn === currentYear) {
            const dayOn = dateOn.date();

            if (!usageByMonth[currentMonth]) {
              usageByMonth[currentMonth] = {};
            }

            if (!usageByMonth[currentMonth][dayOn]) {
              usageByMonth[currentMonth][dayOn] = {};
            }

            let timeDifference = Math.min(dateOff.diff(dateOn, "hours"), 24);
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
              usageByMonth[currentMonth][dayOn][timeUsedDevice.deviceId] =
                24 - timeDifference;
              usageByMonth[monthOff][dayOff][timeUsedDevice.deviceId] =
                timeDifferenceOffNextDay;
            } else {
              if (!usageByMonth[currentMonth][dayOn][timeUsedDevice.deviceId]) {
                usageByMonth[currentMonth][dayOn][timeUsedDevice.deviceId] = 0;
              }
              usageByMonth[currentMonth][dayOn][timeUsedDevice.deviceId] +=
                timeDifference;
            }
          }
        }
      }

      const totalElectricityCostByDevice = {};

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
                electricityCostTotal += (electricityCost - 301) * 2612;
              } else if (electricityCost >= 101) {
                electricityCostTotal += (electricityCost - 301) * 2074;
              } else if (electricityCost >= 50) {
                electricityCostTotal += (electricityCost - 301) * 1786;
              } else {
                electricityCostTotal = electricityCost * 1728;
              }

              if (!totalElectricityCostByDevice[deviceId]) {
                totalElectricityCostByDevice[deviceId] = {
                  totalStaticsByDays: {},
                };
              }

              totalElectricityCostByDevice[deviceId].totalStaticsByDays = {
                usage: usageTime,
                Kwh: electricityCost,
                totalStaticByMonth: electricityCostTotal,
              };
            }
          }
        }
      }

      totalElectricityCostByDevice.currentMonth = currentMonth;

      res.status(200).json({ totalElectricityCostByDevice });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
  async getTotalElectricity(req, res) {
    try {
      const { user_id } = req;
      const currentMonth = moment().tz("Asia/Ho_Chi_Minh").month() + 1;
      const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();

      const rooms = await Room.find({ userId: user_id });
      console.log(rooms);
      const totalElectricityCostByDevice = {};

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

            if (monthOn === currentMonth && yearOn === currentYear) {
              const dayOn = dateOn.date();

              if (!usageByMonth[currentMonth]) {
                usageByMonth[currentMonth] = {};
              }

              if (!usageByMonth[currentMonth][dayOn]) {
                usageByMonth[currentMonth][dayOn] = {};
              }

              let timeDifference = Math.min(dateOff.diff(dateOn, "hours"), 24);
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
                usageByMonth[currentMonth][dayOn][timeUsedDevice.deviceId] =
                  24 - timeDifference;
                usageByMonth[monthOff][dayOff][timeUsedDevice.deviceId] =
                  timeDifferenceOffNextDay;
              } else {
                if (
                  !usageByMonth[currentMonth][dayOn][timeUsedDevice.deviceId]
                ) {
                  usageByMonth[currentMonth][dayOn][
                    timeUsedDevice.deviceId
                  ] = 0;
                }
                usageByMonth[currentMonth][dayOn][timeUsedDevice.deviceId] +=
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
                } else if (electricityCost >= 50) {
                  electricityCostTotal += (electricityCost - 50) * 1786;
                } else {
                  electricityCostTotal = electricityCost * 1728;
                }

                if (!totalElectricityCostByDevice[deviceId]) {
                  totalElectricityCostByDevice[deviceId] = {
                    totalCost: electricityCostTotal,
                  };
                } else {
                  totalElectricityCostByDevice[deviceId].totalCost +=
                    electricityCostTotal;
                }
              }
            }
          }
        }
      }

      let totalCost = 0;
      for (const deviceId in totalElectricityCostByDevice) {
        totalCost += totalElectricityCostByDevice[deviceId].totalCost;
      }

      res.status(200).json({
        code: 200,
        data: {
          totalCost,
        },
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = new statisticController();
