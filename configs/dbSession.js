const session = require('express-session');
const sqlSessionStore = require('express-mysql-session');
const DB = require("./database");

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