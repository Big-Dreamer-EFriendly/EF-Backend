
const authRoutes = require('./authRoutes.js');
const roomRoutes = require('./roomRoutes.js')
const profileRoutes=require('./profileRoutes.js')
const deviceRoomRoutes = require('./deviceRoomRoutes.js')
const deviceRoutes = require('./deviceRoutes.js')

const verifyToken = require('../Middleware/authMiddleware.js');


function routes (app) {
    app.use('/auth',authRoutes);
    app.use('/',roomRoutes,deviceRoomRoutes,profileRoutes,deviceRoutes);
    // app.use('/',);



}


module.exports = routes;