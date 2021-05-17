const Sequelize = require('sequelize');
const Database = require('../configs/database');

const User = Database.sequelize.define('user', {
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    }
});

module.exports = User;