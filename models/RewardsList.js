const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const daysAllowed = [5,10,15,20,25,30,35,40,45,50,55,60]

class RewardsList extends Model {
    get day_no() { return Int8Array(this.getDataValue("day_no")); }
    get food_primary() { return String(this.getDataValue("food_primary")); }
    get food_primary() { return String(this.getDataValue("food_secondary")); }

    set food_primary(food) { this.setDataValue("food_primary", food); }
    set food_secondary(food) { this.setDataValue("food_secondary", food); }
}

RewardsList.init({
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
}, {
    sequelize: Database.sequelize,
    modelName: 'rewards_list',
    hooks: {
        afterUpdate: auto_update_timestamp
    }
});

function auto_update_timestamp(user, options){
    user.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
}

module.exports = { RewardsList };