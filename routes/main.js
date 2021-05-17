const Express = require('express');
const Router = Express.Router();

Router.get('/', (req,res) => {
    res.render('index', {
        author: 'zk, yantat, nigel',
        success_msg: "Hello World!!", // example success
        error_msg: "Error !!" // example error

    })
})

Router.get('/showLogin', (req,res) => {
    res.render('user/login');
});

Router.get('/showRegister', (req,res) => {
    res.render('user/register');
});

module.exports = Router;