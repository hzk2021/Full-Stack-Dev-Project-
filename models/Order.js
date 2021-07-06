const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const Order = Database.sequelize.define('order',{
    uuid:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        default: Sequelize.DataTypes.UUIDV4
    },
    order_id: {
        type: Sequelize.CHAR(6),
        primaryKey: true,
        allowNull: false
    },
    order_item: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false
    },
    order_price: {
        type: Sequelize.FLOAT(4,2),
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
});

module.exports = Order;
