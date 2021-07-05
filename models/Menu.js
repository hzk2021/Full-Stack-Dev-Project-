const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const Menu = Database.sequelize.define('menu',{
    uuid:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        default: Sequelize.DataTypes.UUIDV4
    },
    item_course: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    item_name: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    item_price: {
        type: Sequelize.FLOAT(4,2),
        allowNull: false
    },
    item_description: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
})

module.exports = Menu;