
const authRoutes = require('./authRoutes.js');


function routes (app) {
    app.use('/auth',authRoutes);

}


module.exports = routes;