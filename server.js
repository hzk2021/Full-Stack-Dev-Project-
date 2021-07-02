const Express = require('express');
const ExpHandlebars = require('express-handlebars');
const Path = require('path');
const Flash = require('connect-flash');
const PassportSetup = require('./configs/passportSetup');
const sqlDB = require('./configs/dbConnection');
const sqlSession = require('./configs/dbSession');
const LocalsMiddleware = require('./utilities/locals_object');
const MainRoutes = require('./routes/main');

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

Server.listen(Port, () => console.log(`Server started and is now listening on port ${Port}`))