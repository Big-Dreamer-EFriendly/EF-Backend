const cron = require('node-cron')
const { firebase } = require('../firebase/firebase')


exports.sendNotificationsForTodayReminders = async () => {
  try {
    const { foundHealthChecks, foundTreatmentReminders } = await notificationRepository.fetchRemindersContainingToday();
    if (foundTreatmentReminders.length == 0) {
      return {
        completed: true,
        message: "Hiện tại các thành viên gia đình bạn không có lịch"
      };
    }
    const now = new Date();
    const now_vietnam = new Date(now.getTime() + 7 * 3600000);
    for (const treatmentReminder of foundTreatmentReminders) {
      const { _id, timeOfDay, treatmentTime, medications, noteTreatment, username, deviceToken, userId } = treatmentReminder;
      if (treatmentTime !== now_vietnam.toISOString().slice(11, 16)) {
        continue;
      }
      try {
        await NotificationsTreatment.create({
          treatmentTime: treatmentTime,
          medications: medications,
          noteTreatment: noteTreatment,
          username: username,
          deviceToken: deviceToken,
          userId: userId
        });
        console.log(`Saved data for treatment reminder at ${treatmentTime} to the notificationTreatment table.`);
      } catch (error) {
        console.error('Error saving data to notificationTreatment table:', error);
      }
      let medicationsString = '';
      for (const medication of medications) {
        medicationsString += `   + ${medication.medicationName}: ${medication.dosage}, \n`;
      }
      medicationsString = medicationsString.slice(0, -3);
      console.log(medicationsString);
      const title = 'Treatment reminder | Hello ' + `${username}`;
      const body = `- Drinking time: ${treatmentTime}\n${medicationsString}\n- Note: ${noteTreatment}`;
      await sendNotificationToDevice(deviceToken, title, body);
      await handleSendNotification(deviceToken, title, body)
      console.log(`Sent notification for treatment reminder at ${treatmentTime}`);
    }

    for (const healthCheck of foundHealthChecks) {
      const { reExaminationDate, reExaminationTime, reExaminationLocation, nameHospital, userNote, username, deviceToken, userId } = healthCheck;
      if (reExaminationTime !== now_vietnam.toISOString().slice(11, 16)) {
        continue;
      }
      try {
        await NotificationsHealth.create({
          reExaminationDate: reExaminationDate,
          reExaminationTime: reExaminationTime,
          reExaminationLocation: reExaminationLocation,
          nameHospital: nameHospital,
          userNote: userNote,
          username: username,
          deviceToken: deviceToken,
          userId: userId
        });
        console.log(`Saved data for treatment reminder at ${reExaminationTime} to the notificationTreatment table.`);
      } catch (error) {
        console.error('Error saving data to notificationTreatment table:', error);
      }
      const title = 'Health check reminder | Hello ' + `${username}`;const body = `- Re-examination date: ${reExaminationDate}\n- Re-examination time: ${reExaminationTime}\n- Location: ${reExaminationLocation}\n- Hospital: ${nameHospital}\n- Note: ${userNote}`;
      await sendNotificationToDevice(deviceToken, title, body);
      await handleSendNotification(deviceToken, title, body)
      console.log(`Sent notification for health check reminder at ${reExaminationTime}`);
    }

    console.log('Notification sent successfully.');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function sendNotificationToDevice(deviceToken, title, body) {
  try {
    console.log("deviceToken: ", deviceToken);
    const message = {
      notification: {
        title: title,
        body: body
      },
      token: deviceToken
    };
    const response = await firebase.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
