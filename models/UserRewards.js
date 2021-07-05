<<<<<<< HEAD
const {Sequelize, Model} = require('sequelize');
=======
const Sequelize = require('sequelize');
>>>>>>> origin/main
const Database = require('../configs/database');
const uuid = require('uuid');

const daysAllowed = [5,10,15,20,25,30,35,40,45,50,55,60]

<<<<<<< HEAD
class UserRewards extends Model {
    get uuid() { return String(this.getDataValue("uuid")); }
    get day_no() { return Int16Array(this.getDataValue("day_no")); }
    get claimed() { return (this.getDataValue("claimed")); }

    set claimed(claimed) { this.setDataValue("claimed", claimed); }
}

UserRewards.init({
=======
const UserRewards = Database.sequelize.define('user_rewards', {
>>>>>>> origin/main
    uuid: {
        type: Sequelize.CHAR(36),
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    day_no: {
        type: Sequelize.SMALLINT(2),
        unique: true,
        allowNull: false,
        validate: {
            isIn: [daysAllowed]
        }
    },
    claimed: {
        type: Sequelize.BOOLEAN(),
        allowNull: false,
<<<<<<< HEAD
        defaultValue: false
    }
}, {
    sequelize: Database.sequelize,
    modelName: 'user_rewards',
    hooks: {
        afterUpdate: auto_update_timestamp
    }
});

function auto_update_timestamp(user, options){
    user.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
}

module.exports = { UserRewards };
=======
        default: false
    }
})

module.exports = UserRewards;
>>>>>>> origin/main
