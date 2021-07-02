const Express = require('express');
const Router = Express.Router();

Router.use((req,res,next) => {
    res.locals.user = req.user;
    next();
});

module.exports = Router;