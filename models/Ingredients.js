const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

class Ingredients extends Model {
    get item_name() { return String(this.getDataValue("item_name")); }
    get ingredients_list() { return String(this.getDataValue("ingredients_list")); }

    set item_name(name) { this.setDataValue("item_name", name); }
    set ingredients_list(list) { this.setDataValue("ingredients_list", list); }
}

Ingredients.init({
    item_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    ingredients_list: {
        type: Sequelize.STRING(200),
        allowNull: false,
    }
}, {
    sequelize: Database.sequelize,
    modelName: 'ingredients',
    hooks: {
        afterUpdate: auto_update_timestamp
    }
});

function auto_update_timestamp(user, options){
    user.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
}

module.exports = { Ingredients };