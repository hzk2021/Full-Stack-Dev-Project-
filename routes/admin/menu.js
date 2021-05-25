const Express = require('express');
const Router = Express.Router();

//Create
Router.get('/createMenu', async function(req, res){
	res.render('menu/createMenu', {})
});

//Retrieve
Router.get('/retrieveMenu', async function(req, res){
    var beefb = [
        {
            item:'Guacamole Bacon Cheeseburger',
            price:'11.90',
            img:'img/menu_img/GuacBacon.jpg'
        },
        {
            item:'Chili Cheeseburger',
            price:'13.90',
            img: 'img/<GuacBacon.jpg>'
        }
    ]
    var pab = [
        {
            item:'Original Angus Beef Burger',
            price:'12.90',
            img:'GuacBacon.jpg'
        }
    ]
	res.render('menu/retrieveMenu', {
        beefb: beefb,
        pab: pab
    })
});

//Update
Router.get('/editMenu', async function(req, res){
	res.render('menu/editMenu', {})
    
});

module.exports = Router;