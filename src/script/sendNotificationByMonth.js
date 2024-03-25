const dotenv = require('dotenv');                                                                                                                                                                                  const connect = require('../config/database.js')
const notificaitonController = require('../Controller/notificationController.js')
dotenv.configDotenv();
connect().then(() =>
console.log('====================================');
console.log("aaaaa");
console.log('====================================');
notificaitonController.CompareByMonth().then(() =>
        process.exit()
    )
);