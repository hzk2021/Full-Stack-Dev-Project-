const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

class Payment extends Model {

}

Payment.init({
    uuid:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    payment_order_id:  {
        type: Sequelize.CHAR(36),
        allowNull: false
    },
    payment_user_id:  {
        type: Sequelize.CHAR(36),
        allowNull: false
    },
    payment_amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    payment_stan: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 0,
    },
    payment_dateTime: {
        type: Sequelize.DATE(),
        allowNull: false,
    }
}, {
    sequelize: Database.sequelize,
    modelName: 'payment',
});

module.exports = {Payment};