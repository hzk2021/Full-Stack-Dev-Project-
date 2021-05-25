const Express = require('express');
const Router = Express.Router();

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
});

module.exports = Router;