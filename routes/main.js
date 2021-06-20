const Express = require('express');
const Router = Express.Router();
const AuthRoutes = require('./auth');
const AdminRoutes = require('./admin/admin');
const UserRoutes = require('./user/user');
const {isLoggedIn, isNotLoggedIn, isAdmin} = require('../utilities/account_checker');

Router.use("/auth", AuthRoutes);
Router.use('/admin', AdminRoutes);
Router.use('/user', UserRoutes);

/* Root */
Router.get('/', (req,res) => {
    res.render('index', {
        author: 'zk, yantat, nigel',
        success_msg: "Hello World!!", // example success
        error_msg: "Error !!" // example error
    });
})

module.exports = Router;