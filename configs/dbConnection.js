const DB = require('./database');
const UserModel = require('../models/User');
const Feedback = require('../models/Feedback');
<<<<<<< HEAD
const {RewardsList} = require('../models/RewardsList');
const {UserRewards} = require('../models/UserRewards');
const Supplies = require('../models/Supplies');
const {Ingredients} = require('../models/Ingredients');
const Cart = require('../models/Cart');
=======
const RewardsList = require('../models/RewardsList');
const UserRewards = require('../models/UserRewards');
const Supplies = require('../models/Supplies');
const Ingredients = require('../models/Ingredients')
>>>>>>> origin/main

/* Initialize Database using ORM(Sequelize) */
const InitializeDB = async function(drop){
    await DB.sequelize.authenticate();
    await console.log("Database Connected!");
<<<<<<< HEAD
    //UserModel.User.hasMany(Feedback);
    //UserModel.User.hasMany(UserRewards);
    //RewardsList.hasMany(UserRewards);
    //Menu.hasMany(Ingredients);
    Feedback.belongsTo(UserModel.User, {foreignKey: "uuid"});
    UserRewards.belongsTo(UserModel.User, {foreignKey: "uuid"});
    UserRewards.belongsTo(RewardsList, {foreignKey: "day_no"});
    Ingredients.belongsTo(Menu, {foreignKey: "item_name"});
=======
    UserModel.User.hasMany(Feedback);
    UserModel.User.hasMany(UserRewards);
    RewardsList.hasMany(UserRewards);
    //Change line below accordingly to ur menu name if needed, uncomment it & delete this comment afterwards
    //Menu.hasMany(Ingredients);
>>>>>>> origin/main
    
    await DB.sequelize.sync({
        force: drop
    }).then(() => {
        console.log("Create tables if none exists")
    }).catch(err => console.log(err));
};

module.exports = {InitializeDB}