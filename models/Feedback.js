const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const Feedback = Database.sequelize.define('feedback', {
    uuid: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    dateCreated: {
        type: Sequelize.DATE(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    dateUpdated: {
        type: Sequelize.DATE(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    rating: {
        type: Sequelize.FLOAT(11),
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
});

module.exports = Feedback;