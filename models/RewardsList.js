const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');

const daysAllowed = [5,10,15,20,25,30,35,40,45,50,55,60]

class RewardsList extends Model {
    get day_no() { return Int8Array(this.getDataValue("day_no")); }
    get food_name() { return String(this.getDataValue("food_name")); }
    get food_no() { return String(this.getDataValue("food_no")); }

    set food_name(food) { this.setDataValue("food_name", food); }
    set food_no(food) { this.setDataValue("food_no", food); }
}

RewardsList.init({
    day_no: {
        type: Sequelize.SMALLINT(2),
        primaryKey: true,
        allowNull: false,
        validate: {
            isIn: [daysAllowed]
        }
    },
    food_name: {
        type: Sequelize.STRING(50),
        allowNull: true
    },
    food_no: {
        type: Sequelize.TINYINT(1),
        primaryKey: true,
        min: 1, max: 4,
        allowNull: false
    }
}, {
    sequelize: Database.sequelize,
    modelName: 'rewards_list',
});

module.exports = { RewardsList };
