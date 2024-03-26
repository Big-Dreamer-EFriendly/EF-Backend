const dotenv = require('dotenv');                                                                                                                                                                                  const connect = require('../config/database.js')
const notificaitonController = require('../Controller/notificationController.js')
dotenv.configDotenv();
connect().then(() =>

notificaitonController.CompareByMonth().then(() =>

        process.exit()

    )
);