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
        success_msg: req.flash('success_msg'), // example success
        error_msg: req.flash('error_msg') // example error
    });
});

Router.get('', (req,res,next) =>{
    let err = new Error('URL not found!');
    res.statusCode = 404;
    next(err);
});

module.exports = Router;