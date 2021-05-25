const Express = require('express');
const Router = Express.Router();

/* Root */
Router.get('/', (req,res) => {
    res.render('index', {
        author: 'zk, yantat, nigel',
        success_msg: "Hello World!!", // example success
        error_msg: "Error !!" // example error
    });
})

module.exports = Router;