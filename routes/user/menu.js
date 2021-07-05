const Express = require('express');
const Router = Express.Router();
<<<<<<< HEAD
const {UserRewards} = require('../../models/UserRewards');
=======
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7

//Retrieve
Router.get('/menuPublic', async function(req, res){
    var beefb = [
        {
            item:'Guacamole Bacon Cheeseburger',
            price:'11.90',
<<<<<<< HEAD
            img:'img/GuacBacon.jpg'
=======
            img:'img/<GuacBacon.jpg>'
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
        },
        {
            item:'Chili Cheeseburger',
            price:'13.90',
<<<<<<< HEAD
            img:'img/GuacBacon.jpg'
=======
            img:'GuacBacon.jpg'
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
        }
    ]
    var pab = [
        {
            item:'Original Angus Beef Burger',
            price:'12.90',
<<<<<<< HEAD
            img:'img/GuacBacon.jpg'
        }
    ]
    // Below is for rewards
    // Get user rewards
    const rewards = null;
    try {
        rewards = await UserRewards.findAll({
            where:{uuid:req.user.uuid, claimed:false},
            order: [['day_no', 'ASC']],
            raw: true
        });
    }
    catch (TypeError) {
        console.log("User is not signed in");
    }

	res.render('menu/menuPublic', {
        beefb: beefb,
        pab: pab,
        prizes_list: rewards
=======
            img:'GuacBacon.jpg'
        }
    ]
	res.render('menu/menuPublic', {
        beefb: beefb,
        pab: pab
>>>>>>> 5b0384f595249e75eb917ceca5583bf00613e5a7
	})
});

module.exports = Router;