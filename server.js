const Express = require('express');
const ExpHandlebars = require('express-handlebars');
const Path = require('path');
const Flash = require('connect-flash');
const sqlDB = require('./configs/dbConnection');
const sqlSession = require('./configs/dbSession');
const MainRoutes = require('./routes/main');
const AuthRoutes = require('./routes/auth');
//The routes
const AdminMenu = require('./routes/admin/menu');
const OrderDashboard = require('./routes/admin/orderDashboard');
const UserMenu = require('./routes/user/menu');
const UserCart = require('./routes/user/cart');

const Server = Express();
const Port = process.env.PORT || 5000;

Server.engine('handlebars', ExpHandlebars({
    defaultLayout: 'main'
}));

Server.set('views',       'templates');
Server.set('view engine', 'handlebars');

Server.use(Express.static(Path.join(__dirname, 'public')));

Server.use(Express.urlencoded({
    extended: false
}));

Server.use(Express.json());
Server.use(sqlSession);

Server.use('/', [MainRoutes, AdminMenu, OrderDashboard, UserMenu, UserCart]); // Main
Server.use('/auth', AuthRoutes); // Auth



sqlDB.InitializeDB(false);

Server.listen(Port, () => console.log(`Server started and is now listening on port ${Port}`))