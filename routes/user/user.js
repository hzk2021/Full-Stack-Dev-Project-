const Express = require('express');
const Router = Express.Router();
<<<<<<< HEAD

const Rewards = require("./rewards");
const Cart = require("./cart");
const Menu = require("./menu");
const Order = require("./rewards");

Router.use('/rewards', Rewards);
Router.use('/cart', Cart);
Router.use('/menu', Menu);
Router.use('/order', Order);
=======
const UserOrderRoute = require('./order');
const UserRewardsRoute = require('./rewards');
const UserProfileRoute = require('./profile');

Router.use("/order", UserOrderRoute);
Router.use('/rewards', UserRewardsRoute);
Router.use("/profile", UserProfileRoute);
>>>>>>> origin/main

module.exports = Router;