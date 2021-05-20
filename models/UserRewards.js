const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const daysAllowed = [[5,10,15,20,25,30,35,40,45,50,55,60]]

const UserRewards = Database.sequelize.define('user_rewards', {
    day_no: {
        type: Sequelize.SMALLINT(2),
        unique: true,
        allowNull: false,
        validate: {
            isIn: daysAllowed
        }
    },
    uuid: {
        type: Sequelize.CHAR(36),
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    claimed: {
        type: Sequelize.BOOLEAN(),
        allowNull: false,
        default: false
    }
})

module.exports = UserRewards;