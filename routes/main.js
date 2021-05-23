const Express = require('express');
const Router = Express.Router();

Router.get('/', (req,res) => {
    res.render('index', {
        author: 'zk, yantat, nigel',
        success_msg: "Hello World!!", // example success
        error_msg: "Error !!" // example error
    });
})

Router.get('/showLogin', (req,res) => {
    res.render('authentication/login');
});

Router.get('/showRegister', (req,res) => {
    res.render('authentication/register');
});

// Connect flash & session store example
// Router.get('/', (req,res) => {
//     res.render('index', {
//         author: 'zk, yantat, nigel',
//         success_msg: req.flash('success_msg'), // connect flash example success
//         error_msg: "Error !!" // example error
//     })
// })

// Router.get('/showLogin', (req,res) => {
//     req.session.test = true; // Will also be stored in mysql db
//     console.log(req.session);
//     req.flash('success_msg', 'idk');
//     res.redirect('/');
// });

module.exports = Router;