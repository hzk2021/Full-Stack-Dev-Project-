const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const { Supplies } = require('./Supplies');


class SupplyPerformance extends Model {
    get item_id() { return String(this.getDataValue("item_id")); }
    get val_change() { return Number(this.getDataValue("val_change")); }
    get next_value() { return Number(this.getDataValue("next_value")); }

    set item_id(id) { this.setDataValue("item_id", id); }
    set val_change(val) { this.setDataValue("val_change", val); }
    set next_value(val) { this.setDataValue("next_value", val); }
}

SupplyPerformance.init({
    item_id:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        references: {
            model: Supplies,
            key: 'item_id',
        }
    },
    week_no: {
        type: Sequelize.INTEGER(2),
        defaultValue: 1,
        primaryKey: true,
        max: 5,
        min: 1
    },
    current_stock_lvl: {
        type: Sequelize.BIGINT(5),
        defaultValue: 0
    },
    stock_used: {
        type: Sequelize.BIGINT(5),
        defaultValue: 0
    },
    date_submitted: {
        type: Sequelize.DATE(),
        allowNull: true,
        defaultValue: Sequelize.NOW
    },
},  {
        sequelize: Database.sequelize,
        modelName: 'supply_performances',
        hooks: {
            afterUpdate: auto_update_timestamp
        }
});

function auto_update_timestamp(user, options){
    user.date_submitted = Sequelize.literal('CURRENT_TIMESTAMP');
}

module.exports = {SupplyPerformance};
