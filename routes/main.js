const Express = require('express');
const Router = Express.Router();
const AuthRoutes = require('./auth');
const AdminRoutes = require('./admin/admin');
const SupplierRoutes = require('./supplier');
const UserRoutes = require('./user/user');
const {isLoggedIn, isNotLoggedIn, isAdmin, isSupplier} = require('../utilities/account_checker');

Router.use("/auth", AuthRoutes);
Router.use('/admin', isLoggedIn, isAdmin, AdminRoutes);
Router.use('/supplier', isLoggedIn, SupplierRoutes);
Router.use('/user', UserRoutes);

/* Root */
Router.get('/', (req,res) => {
    try {
        if (req.user.role == "admin") {
            return res.render('home/adminHome', {});
        }
        else if (req.user.role == "supplier") {
            return res.render('home/supplierHome', {});
        }
        return res.render('home/userHome', {});
    }
    catch (error) {
        return res.render('home/userHome', {});
    }
});

Router.get('*', (req,res,next) => {
    // let err = new Error('URL not found!');
    // res.statusCode = 404;
    // next(err);
    return res.redirect('/');
});

module.exports = Router;