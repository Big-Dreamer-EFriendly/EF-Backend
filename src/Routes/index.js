
const authRoutes = require('./authRoutes.js');
const UserRouter= require('./loginRoutes.js');
const verifyToken = require('../Middleware/authMiddleware.js');


function routes (app) {
    app.use('/auth',authRoutes);

}


module.exports = routes;