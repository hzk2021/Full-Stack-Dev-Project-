const DB = require('./database');
const User = require('../models/User');
const Menu = require('../models/Menu');
const Order = require('../models/Order');



const InitializeDB = async function(drop){
    await DB.sequelize.authenticate()
    await console.log("Database Connected!");
    User.hasMany(Order)
    // User.hasMany(inserthere) // This is to link another table (auto define the foreign key)
    await DB.sequelize.sync({
        force: drop
    }).then(() => {
        console.log("Create tables if none exists")
    }).catch(err => console.log(err));
};

module.exports = {InitializeDB}