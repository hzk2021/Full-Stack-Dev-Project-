const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

class Order extends Model {

}

Order.init({
    uuid:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        default: Sequelize.DataTypes.UUIDV4
    },
    order_id: {
        type: Sequelize.CHAR(6),
        allowNull: false
    },
    order_item: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    order_price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    order_item_quantity: {
        type: Sequelize.TINYINT(2),
        allowNull: false
    },
    item_description: {
        type: Sequelize.STRING(64)
    },
    order_time: {
        type: Sequelize.TIME(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    order_date: {
        type: Sequelize.DATEONLY(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
}, {
    sequelize: Database.sequelize,
    modelName: 'order',
});

module.exports = {Order};