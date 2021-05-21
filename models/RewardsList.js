const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const daysAllowed = [5,10,15,20,25,30,35,40,45,50,55,60]

const RewardsList = Database.sequelize.define('rewards_list', {
    day_no: {
        type: Sequelize.SMALLINT(2),
        primaryKey: true,
        unique: true,
        allowNull: false,
        validate: {
            isIn: [daysAllowed]
        }
    },
    food_primary: {
        type: Sequelize.STRING(50),
        allowNull: true
    },
    food_secondary: {
        type: Sequelize.STRING(50),
        allowNull: true
    }
})

module.exports = RewardsList;