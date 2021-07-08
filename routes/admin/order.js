const Express = require('express');
const Router = Express.Router();

Router.get('/dashboard', async function(req, res){
	res.render('cart/dashboard', {
		order_dict:{
			1: ["Chargrilled Chicken Club", "Coca-Cola"],
			2: ["Chili Burger", "Sprite"]
		}
	})
});

module.exports = Router;