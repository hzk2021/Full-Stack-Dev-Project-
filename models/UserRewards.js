const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const { RewardsList } = require('./RewardsList');
const { User } = require('./User');

const daysAllowed = [5,10,15,20,25,30,35,40,45,50,55,60];

class UserRewards extends Model {
    get uuid() { return String(this.getDataValue("uuid")); }
    get day_no() { return Int16Array(this.getDataValue("day_no")); }
    get claimed() { return (this.getDataValue("claimed")); }

    set claimed(claimed) { this.setDataValue("claimed", claimed); }
}

UserRewards.init({
    day_no: {
        type: Sequelize.SMALLINT(2),
        primaryKey: true,
        allowNull: false,
        validate: {
            isIn: [daysAllowed]
        },
        references: {
            model: RewardsList,
            key: 'day_no',
        }
    },
    uuid: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        references: {
            model: User,
            key: 'uuid',
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
