const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

class MenuCategory extends Model {
    get category_no() { return String(this.getDataValue("category_no")); }
    get category_name() { return String(this.getDataValue("category_name")); }

    set category_name(name) { this.setDataValue("category_name", name); }
    set category_no(num) { this.setDataValue("category_no", num); }
}

MenuCategory.init({
    category_no: {
        type: Sequelize.TINYINT(1),
        primaryKey: true,
        allowNull: false
    },
    category_name: {
        type: Sequelize.STRING(30),
        allowNull: false
    }
}, {
    sequelize: Database.sequelize,
    modelName: 'menu_category',
});

module.exports = { MenuCategory };
