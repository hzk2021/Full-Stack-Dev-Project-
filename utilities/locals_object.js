const Express = require('express');
const Router = Express.Router();

Router.use((req,res,next) => {
    res.locals.user = req.user;
    if (res.locals.user){
        res.locals.userRole = req.user.role;
    }
    
    next();
});

module.exports = Router;