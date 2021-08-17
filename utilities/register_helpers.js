// Custom handlebars
const ExpHandlebars = require('express-handlebars');

const Hbs = ExpHandlebars.create({});

const RegisterHelpers = async function () {
    await Hbs.handlebars.registerHelper('ifIn', function(elem, list, options) {
        for (const property in list) {
            if (list[property] == elem){
                return options.fn(this);
            }
        }
        return options.inverse(this);
      });

    await Hbs.handlebars.registerHelper('with', function(context, options){
        return options.fn(context);
    });
    
    
    await Hbs.handlebars.registerHelper('for', function(from, to, block) {
        var accum = '';
        for(var i = from; i < to; ++i)
            accum += block.fn(i);
        return accum;
    });
    
    await Hbs.handlebars.registerHelper('set', function(varName, operator, varValue, options) {   
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
    
    await Hbs.handlebars.registerHelper('ifc', function (v1, operator, v2, options) {
    
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

    await Hbs.handlebars.registerHelper('json', function (content) {
        return JSON.stringify(content);
    });

    await Hbs.handlebars.registerHelper('grouped_each', function(every, context, options) {
        var out = "", subcontext = [], i;
        if (context && context.length > 0) {
            for (i = 0; i < context.length; i++) {
                if (i > 0 && i % every === 0) {
                    out += options.fn(subcontext);
                    subcontext = [];
                }
                subcontext.push(context[i]);
            }
            out += options.fn(subcontext);
        }
        return out;
    });
}

module.exports = {RegisterHelpers};
