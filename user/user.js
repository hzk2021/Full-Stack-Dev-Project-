const Express = require('express');
const Router = Express.Router();

const Rewards = require("./rewards");
const Cart = require("./cart");
const Menu = require("./menu");
const Order = require("./rewards");

Router.use('/rewards', Rewards);
Router.use('/cart', Cart);
Router.use('/menu', Menu);
Router.use('/order', Order);

module.exports = Router;