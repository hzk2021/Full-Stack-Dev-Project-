const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

class Order extends Model {

}

Order.init({
    uuid:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    order_id:  {
        type: Sequelize.CHAR(36),
        allowNull: false
    },
    order_item_name: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    order_item_price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    order_item_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    order_dateTime: {
        type: Sequelize.DATE(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    order_user_id:  {
        type: Sequelize.CHAR(36),
        allowNull: false
    },
}, {
    sequelize: Database.sequelize,
    modelName: 'order',
});

module.exports = {Order};