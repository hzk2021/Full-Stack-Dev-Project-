const Sequelize = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

const Order = Database.sequelize.define('order',{
    uuid:  {
        type: Sequelize.CHAR(36),
<<<<<<< HEAD
=======
        primaryKey: true,
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
        default: Sequelize.DataTypes.UUIDV4
    },
    order_id: {
        type: Sequelize.CHAR(6),
<<<<<<< HEAD
        primaryKey: true,
=======
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
        allowNull: false
    },
    order_item: {
        type: Sequelize.STRING(64),
<<<<<<< HEAD
        primaryKey: true,
=======
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
        allowNull: false
    },
    order_price: {
        type: Sequelize.FLOAT(4,2),
        allowNull: false
    },
    order_item_quantity: {
        type: Sequelize.TINYINT(2),
        allowNull: false
    },
    item_description: {
        type: Sequelize.STRING(64)
    },
    order_time: {
        type: Sequelize.TIME(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    order_date: {
        type: Sequelize.DATEONLY(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
<<<<<<< HEAD
});

module.exports = Order;
=======
})
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
