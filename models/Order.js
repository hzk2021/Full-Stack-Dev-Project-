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
    order_item_name: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    cart_item_price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    cart_item_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
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