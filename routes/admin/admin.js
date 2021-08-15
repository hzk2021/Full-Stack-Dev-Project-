const Express = require('express');
const Router = Express.Router();

const Rewards = require("./rewards");
const Inventory = require("./inventory");
const Menu = require("./menu");
const Order = require("./rewards");
const Accounts = require("./accounts");
const Feedback = require("./feedback");
const Entry = require("./entry");
const gDashboard = require("./gDashboard");

Router.use('/rewards', Rewards);
Router.use('/inventory', Inventory);
Router.use('/menu', Menu);
Router.use('/order', Order);
Router.use('/accounts', Accounts);
Router.use('/feedback', Feedback);
Router.use('/entry', Entry);
Router.use('/dashboard', gDashboard);

module.exports = Router;