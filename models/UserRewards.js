const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');

const daysAllowed = [5,10,15,20,25,30,35,40,45,50,55,60]

class UserRewards extends Model {
    get uuid() { return String(this.getDataValue("uuid")); }
    get day_no() { return Int16Array(this.getDataValue("day_no")); }
    get claimed() { return (this.getDataValue("claimed")); }

    set claimed(claimed) { this.setDataValue("claimed", claimed); }
}

UserRewards.init({
    uuid: {
        type: Sequelize.CHAR(36),
        primaryKey: true
    },
    day_no: {
        type: Sequelize.SMALLINT(2),
        primaryKey: true,
        unique: true,
        allowNull: false,
        validate: {
            isIn: [daysAllowed]
        }
    },
    claimed: {
        type: Sequelize.BOOLEAN(),
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: Database.sequelize,
    modelName: 'user_rewards',
});

module.exports = { UserRewards };
