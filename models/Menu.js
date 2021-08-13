const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const Menu = Database.sequelize.define('menu',{
    uuid:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    item_name: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    item_price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    item_course: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    item_description: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
    item_ingredients: {
        type: Sequelize.STRING(2000),
        allowNull: true
    },
});

module.exports = Menu;