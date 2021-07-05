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
<<<<<<< HEAD
            img:'img/GuacBacon.jpg'
=======
            img:'img/menu_img/GuacBacon.jpg'
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
        },
        {
            item:'Chili Cheeseburger',
            price:'13.90',
<<<<<<< HEAD
            img: 'img/GuacBacon.jpg'
=======
            img: 'img/<GuacBacon.jpg>'
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
        }
    ]
    var pab = [
        {
            item:'Original Angus Beef Burger',
            price:'12.90',
<<<<<<< HEAD
            img:'img/GuacBacon.jpg'
=======
            img:'GuacBacon.jpg'
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
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