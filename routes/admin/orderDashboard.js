const Express = require('express');
const Router = Express.Router();
const {isLoggedIn, isNotLoggedIn, isAdmin} = require('../../utilities/account_checker');

Router.get('/dashboard', isLoggedIn, isAdmin,async function(req, res){
	res.render('scart/dashboard', {
		order_dict:{
			1: ["Chargrilled Chicken Club", "Coca-Cola"],
			2: ["Chili Burger", "Sprite"]
		}
	})
});

module.exports = Router;