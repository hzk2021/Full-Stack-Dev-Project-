const Express = require('express');
const Router = Express.Router();
const UserOrderRoute = require('./order');
const UserRewardsRoute = require('./rewards');
const UserProfileRoute = require('./profile');

Router.use("/order", UserOrderRoute);
Router.use('/rewards', UserRewardsRoute);
Router.use("/profile", UserProfileRoute);

module.exports = Router;