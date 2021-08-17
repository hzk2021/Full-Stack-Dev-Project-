const Express = require('express');
const Router = Express.Router();

const Rewards = require("./rewards");
const Cart = require("./cart");
const Menu = require("./menu");
const Order = require("./order");
const Profile = require("./profile");
const Feedback = require("./feedback");
const Address = require("./address");

Router.use('/rewards', Rewards);
Router.use('/cart', Cart);
Router.use('/menu', Menu);
Router.use('/order', Order);
Router.use('/profile', Profile);
Router.use('/feedback', Feedback);
Router.use('/address', Address);

module.exports = Router;