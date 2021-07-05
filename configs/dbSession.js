const session = require('express-session');
const sqlSessionStore = require('express-mysql-session');
const DB = require("./database");

<<<<<<< HEAD
/* Export function => Setup session and store it in mySQL */
=======
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
module.exports = session({
    key: 'project_session',
    secret: 'session_secret',
    store: new sqlSessionStore({
        host: DB.dbConfig.host,
        port: DB.dbConfig.port,
        user: DB.dbConfig.username,
        password: DB.dbConfig.password,
        database: DB.dbConfig.database,
        checkExpired: true,
        checkExpirationInterval: 900000,
        expiration: 900000,
    }),
    resave: false,
    saveUninitialized: false
});