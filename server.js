const Express = require('express');
const ExpHandlebars = require('express-handlebars');
const BodyParser = require('body-parser');
const Path = require('path');
const MainRoutes = require('./routes/main');
const sqlDB = require('./configs/dbConnection');
const sqlSession = require('./configs/dbSession');

const Server = Express();
const Port = process.env.PORT || 5000;

Server.engine('handlebars', ExpHandlebars({
    defaultLayout: 'main'
}));

Server.set('views',       'templates');
Server.set('view engine', 'handlebars');

Server.use(BodyParser.urlencoded({
    extended: false
}));

Server.use(BodyParser.json());
Server.use(sqlSession);

Server.use('/', MainRoutes); // Main

sqlDB.InitializeDB(false);

Server.listen(Port, () => console.log(`Server started and is now listening on port ${Port}`))