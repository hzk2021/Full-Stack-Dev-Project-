const Express = require('express');
const ExpHandlebars = require('express-handlebars');
const Path = require('path');
const Flash = require('connect-flash');
<<<<<<< HEAD
const PassportSetup = require('./configs/passportSetup');
const sqlDB = require('./configs/dbConnection');
const sqlSession = require('./configs/dbSession');
const LocalsMiddleware = require('./utilities/locals_object');
const MainRoutes = require('./routes/main');
<<<<<<< HEAD
const registerHelper = require('./utilities/register_helpers');
=======
>>>>>>> origin/main
=======
const sqlDB = require('./configs/dbConnection');
const sqlSession = require('./configs/dbSession');
const MainRoutes = require('./routes/main');
const AuthRoutes = require('./routes/auth');
//The routes
const AdminMenu = require('./routes/admin/menu');
const OrderDashboard = require('./routes/admin/orderDashboard');
const UserMenu = require('./routes/user/menu');
const UserCart = require('./routes/user/cart');
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7

const Server = Express();
const Port = process.env.PORT || 5000;

Server.engine('handlebars', ExpHandlebars({
    defaultLayout: 'main'
}));

<<<<<<< HEAD
const Hbs = ExpHandlebars.create({});

=======
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
Server.set('views',       'templates');
Server.set('view engine', 'handlebars');

Server.use(Express.static(Path.join(__dirname, 'public')));

Server.use(Express.urlencoded({
    extended: false
}));

Server.use(Express.json());
Server.use(sqlSession);
<<<<<<< HEAD
Server.use(Flash());
PassportSetup.InitializePassport(Server);
sqlDB.InitializeDB(false);
Server.use(LocalsMiddleware);

Server.use('/', MainRoutes); // Main
<<<<<<< HEAD
registerHelper.RegisterHelpers(); // Registering custom handlebars
=======

// Custom handlebars 
Hbs.handlebars.registerHelper('with', function(context, options){
    return options.fn(context);
});


Hbs.handlebars.registerHelper('for', function(from, to, block) {
    var accum = '';
    for(var i = from; i < to; ++i)
        accum += block.fn(i);
    return accum;
});

Hbs.handlebars.registerHelper('set', function(varName, operator, varValue, options) {   
    switch (operator) {
        case '=':
            options.data.root[varName] = varValue;
        case '+=':
            options.data.root[varName] = varName + varValue;
        case '-=':
            options.data.root[varName] = varName - varValue;
        default:
            options.data.root[varName] = varValue; 
    }
});

Hbs.handlebars.registerHelper('ifc', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
>>>>>>> origin/main
=======

Server.use('/', [MainRoutes, AdminMenu, OrderDashboard, UserMenu, UserCart]); // Main
Server.use('/auth', AuthRoutes); // Auth



sqlDB.InitializeDB(false);
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7

Server.listen(Port, () => console.log(`Server started and is now listening on port ${Port}`))