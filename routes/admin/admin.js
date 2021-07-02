const Express = require('express');
const Router = Express.Router();
const InventoryRoute = require('./inventory');
const RewardsRoute = require('./rewards');
const AccountsListRoute = require('./accounts');

Router.use("/inventory", InventoryRoute);
Router.use('/rewards', RewardsRoute);
Router.use("/accounts", AccountsListRoute);

module.exports = Router;