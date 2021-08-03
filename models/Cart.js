const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const Cart = Database.sequelize.define('cart',{
    uuid:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    cart_user_id: {
        type: Sequelize.CHAR(36),
        allowNull: false
    },
    cart_item_id: {
        type: Sequelize.CHAR(36),
        allowNull: false
    },
    cart_item_name: {
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
});

module.exports = Cart;