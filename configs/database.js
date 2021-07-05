const Sequelize = require('sequelize');

<<<<<<< HEAD
/* Database Configuration */
=======
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
const dbConfig = {
    host: 'localhost',
    database: 'project2021',
    username: 'project2021',
    password: 'project2021',
    port: 3306
}

<<<<<<< HEAD
/* Define Sequelize DB */
=======
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    operatorsAliases: false,

    define: {
        timestamps: false
    },

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = {dbConfig, sequelize};
