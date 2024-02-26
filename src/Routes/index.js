
const authRoutes = require('./authRoutes.js');
const roomRoutes = require('./roomRoutes.js')
const verifyToken = require('../Middleware/authMiddleware.js');


function routes (app) {
    app.use('/auth',authRoutes);
    app.use('/auth',verifyToken,roomRoutes);


}


module.exports = routes;