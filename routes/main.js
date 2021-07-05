const Express = require('express');
const Router = Express.Router();
<<<<<<< HEAD
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

<<<<<<< HEAD
Router.get('', (req,res,next) =>{
=======
Router.get('*', (req,res,next) =>{
>>>>>>> origin/main
    let err = new Error('URL not found!');
    res.statusCode = 404;
    next(err);
=======

Router.get('/', (req,res) => {
    res.render('index', {
        author: 'zk, yantat, nigel',
        success_msg: "Hello World!!", // example success
        error_msg: "Error !!" // example error

    })
})

// Logout User
Router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

// Login page
Router.get('/showLogin', (req, res) => {
	res.render('user/login') // renders user/login.handlebars
});

// Register page
Router.get('/showRegister', (req, res) => {
	res.render('user/register') // renders user/register.handlebars
});

// About page
Router.get('/about', (req, res) => {
	const developer = 'Robert Lim';
	res.render('about', {developer: developer}) // renders views/about.handlebars
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
});

module.exports = Router;