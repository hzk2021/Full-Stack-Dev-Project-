const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const Ingredients = Database.sequelize.define('ingredients', {
    food_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    ingredients_list: {
        type: Sequelize.STRING(200),
        allowNull: false,
    }
})