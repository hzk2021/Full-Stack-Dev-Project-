const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');

class SupplyPerformance extends Model {
    get item_id() { return String(this.getDataValue("item_id")); }
    get val_change() { return Number(this.getDataValue("val_change")); }
    get next_value() { return Number(this.getDataValue("next_value")); }

    set item_id(id) { this.setDataValue("item_id", id); }
    set val_change(val) { this.setDataValue("val_change", val); }
    set next_value(val) { this.setDataValue("next_value", val); }
}

SupplyPerformance.init({
    date_submitted: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
    },
    val_change: {
        type: Sequelize.DECIMAL(5, 5),
        allowNull: true,
        defaultValue: null
    },
    next_value: {
        type: Sequelize.INTEGER(7),
        allowNull: true,
        defaultValue: null
    },
},  {
        sequelize: Database.sequelize,
        modelName: 'supply_performances',
});

module.exports = {SupplyPerformance};
