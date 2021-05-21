const DB = require('./database');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const RewardsList = require('../models/RewardsList');
const UserRewards = require('../models/UserRewards');
const Supplies = require('../models/Supplies');
const Ingredients = require('../models/Ingredients')

const InitializeDB = async function(drop){
    await DB.sequelize.authenticate();
    await console.log("Database Connected!");
    User.hasMany(Feedback);
    User.hasMany(UserRewards);
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