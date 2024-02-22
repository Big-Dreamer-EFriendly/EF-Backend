
const authRoutes = require('./authRoutes.js');
const UserRouter= require('./loginRoutes.js')


function routes (app) {
    app.use('/auth',authRoutes);
    app.use('/api', UserRouter);

}


module.exports = routes;