const Express = require('express');
const Router = Express.Router();
const InventoryRoute = require('./inventory');
const RewardsRoute = require('./rewards');

Router.use("/inventory", InventoryRoute);
Router.use('/rewards', RewardsRoute);

module.exports = Router;