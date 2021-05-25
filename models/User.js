const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const UserRole = {
    Admin: "admin",
    User: "user"
};

const User = Database.sequelize.define('user', {
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
    name: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
    role: {
        type: Sequelize.ENUM(UserRole.Admin, UserRole.User),
        allowNull: false,
        defaultValue: UserRole.User
    },
    password: {
        type: Sequelize.STRING(64),
        allowNull: false
    }
});

module.exports = User;