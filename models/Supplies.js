const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

class Supplies extends Model {
    get item_id() { return String(this.getDataValue("item_id")); }
    get item_name() { return String(this.getDataValue("item_name")); }
    get category_no() { return String(this.getDataValue("category_no")); }
    get current_stocks() { return Int16Array(this.getDataValue("current_stock_lvl")); }
    get stock_used() { return Int16Array(this.getDataValue("stock_used")); }

    set item_id(id) { this.setDataValue("item_id", id); }
    set item_name(name) { this.setDataValue("item_name", name); }
    set category_no(category_no) { this.setDataValue("category", category_no); }
}

Supplies.init({
    item_id:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    item_name: {
        type: Sequelize.STRING(40),
        allowNull: false
    },
    val_change: {
        type: Sequelize.DECIMAL(9, 5),
        allowNull: true,
        defaultValue: null
    },
    next_value: {
        type: Sequelize.INTEGER(7),
        allowNull: true,
        defaultValue: null
    },
}, {
        sequelize: Database.sequelize,
        modelName: 'supplies',
        hooks: {
            afterUpdate: auto_update_timestamp
        }
});

function auto_update_timestamp(supplies, options) {
    supplies.date_submitted = Sequelize.literal('CURRENT_TIMESTAMP');
}

module.exports = {Supplies};