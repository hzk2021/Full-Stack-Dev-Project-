const Express = require('express');
const Router = Express.Router();
const UserOrderRoute = require('./order');
const UserRewardsRoute = require('./rewards');

Router.use("/order", UserOrderRoute);
Router.use('/rewards', UserRewardsRoute);

module.exports = Router;