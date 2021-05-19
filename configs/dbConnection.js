const DB = require('./database');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

const InitializeDB = async function(drop){
    await DB.sequelize.authenticate()
    await console.log("Database Connected!");
    User.hasMany(Feedback)
    await DB.sequelize.sync({
        force: drop
    }).then(() => {
        console.log("Create tables if none exists")
    }).catch(err => console.log(err));
};

module.exports = {InitializeDB}