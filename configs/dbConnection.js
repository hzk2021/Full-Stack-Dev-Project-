const DB = require('./database');
const UserModel = require('../models/User');
const Feedback = require('../models/Feedback');
const {RewardsList} = require('../models/RewardsList');
const {UserRewards} = require('../models/UserRewards');
const Supplies = require('../models/Supplies');
const {Ingredients} = require('../models/Ingredients')
const Menu = require('../models/Menu')
const Order = require('../models/Order')
const Cart = require('../models/Cart')


/* Initialize Database using ORM(Sequelize) */
const InitializeDB = async function(drop){
    await DB.sequelize.authenticate();
    await console.log("Database Connected!");
    UserModel.User.hasMany(Feedback);
    UserModel.User.hasMany(UserRewards);
    RewardsList.hasMany(UserRewards);
    //Change line below accordingly to ur menu name if needed, uncomment it & delete this comment afterwards
    //Menu.hasMany(Ingredients);
    
    await DB.sequelize.sync({
        force: drop
    }).then(() => {
        console.log("Create tables if none exists")
    }).catch(err => console.log(err));
};

module.exports = {InitializeDB}
