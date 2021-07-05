const Express = require('express');
const Router = Express.Router();
<<<<<<< HEAD

const Rewards = require("./rewards");
const Inventory = require("./inventory");
const Menu = require("./menu");
const Order = require("./rewards");

Router.use('/rewards', Rewards);
Router.use('/inventory', Inventory);
Router.use('/menu', Menu);
Router.use('/order', Order);
=======
const InventoryRoute = require('./inventory');
const RewardsRoute = require('./rewards');
const AccountsListRoute = require('./accounts');

Router.use("/inventory", InventoryRoute);
Router.use('/rewards', RewardsRoute);
Router.use("/accounts", AccountsListRoute);
>>>>>>> origin/main

module.exports = Router;