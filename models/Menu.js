const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const Menu = Database.sequelize.define('menu',{
    uuid:  {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        default: Sequelize.DataTypes.UUIDV4
    },
    item_course: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    item_name: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    item_price: {
        type: Sequelize.FLOAT(4,2),
        allowNull: false
    },
    item_description: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
<<<<<<< HEAD
})

module.exports = Menu;
=======
})
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
