const Express = require('express');
const Router = Express.Router();

//Retrieve
Router.get('/menuPublic', async function(req, res){
    var beefb = [
        {
            item:'Guacamole Bacon Cheeseburger',
            price:'11.90',
            img:'img/<GuacBacon.jpg>'
        },
        {
            item:'Chili Cheeseburger',
            price:'13.90',
            img:'GuacBacon.jpg'
        }
    ]
    var pab = [
        {
            item:'Original Angus Beef Burger',
            price:'12.90',
            img:'GuacBacon.jpg'
        }
    ]
	res.render('menu/menuPublic', {
        beefb: beefb,
        pab: pab
	})
});

module.exports = Router;