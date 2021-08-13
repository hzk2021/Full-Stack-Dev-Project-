const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

class Cart extends Model {

}

Cart.init({
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
}, {
    sequelize: Database.sequelize,
    modelName: 'cart',
});

module.exports = {Cart};