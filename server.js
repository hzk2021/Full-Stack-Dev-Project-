const Express = require('express');
const ExpHandlebars = require('express-handlebars');
const Path = require('path');
const Flash = require('connect-flash');
const PassportSetup = require('./configs/passportSetup');
const sqlDB = require('./configs/dbConnection');
const sqlSession = require('./configs/dbSession');
const LocalsMiddleware = require('./utilities/locals_object');
const MainRoutes = require('./routes/main');
const registerHelper = require('./utilities/register_helpers');

const Server = Express();
const Port = process.env.PORT || 5000;

Server.engine('handlebars', ExpHandlebars({
    defaultLayout: 'main'
}));

const Hbs = ExpHandlebars.create({});

Server.set('views',       'templates');
Server.set('view engine', 'handlebars');

Server.use(Express.static(Path.join(__dirname, 'public')));

Server.use(Express.urlencoded({
    extended: false
}));

Server.use(Express.json());
Server.use(sqlSession);
Server.use(Flash());
PassportSetup.InitializePassport(Server);
sqlDB.InitializeDB(false);
Server.use(LocalsMiddleware);

Server.use('/', MainRoutes); // Main
registerHelper.RegisterHelpers(); // Registering custom handlebars

Server.listen(Port, () => console.log(`Server started and is now listening on port ${Port}`))