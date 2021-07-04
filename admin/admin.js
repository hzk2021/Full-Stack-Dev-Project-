const Express = require('express');
const Router = Express.Router();

const Rewards = require("./rewards");
const Inventory = require("./inventory");
const Menu = require("./menu");
const Order = require("./rewards");

Router.use('/rewards', Rewards);
Router.use('/inventory', Inventory);
Router.use('/menu', Menu);
Router.use('/order', Order);

module.exports = Router;