const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const Supplies = Database.sequelize.define('supplies', {
    uuid:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        default: Sequelize.DataTypes.UUIDV4
    },
    item_name: {
        type: Sequelize.STRING(40),
        allowNull: false
    },
    category: {
        type: Sequelize.STRING(),
        allowNull: false,
    },
    current_stock_lvl: {
        type: Sequelize.BIGINT(5),
        default: 0
    },
    date_submitted: {
        type: Sequelize.DATE,
        allowNull: false,
        default: Sequelize.NOW
    },
    stock_used: {
        type: Sequelize.BIGINT(5),
        default: 0
    },
    week_no: {
        type: Sequelize.INTEGER(1),
    }
});

module.exports = Supplies;