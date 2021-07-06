const Express = require('express');
const Router = Express.Router();
const {UserRewards} = require('../../models/UserRewards');

//Retrieve
Router.get('/menuPublic', async function(req, res){
    var beefb = [
        {
            item:'Guacamole Bacon Cheeseburger',
            price:'11.90',
            img:'img/GuacBacon.jpg'
        },
        {
            item:'Chili Cheeseburger',
            price:'13.90',
            img:'img/GuacBacon.jpg'
        }
    ]
    var pab = [
        {
            item:'Original Angus Beef Burger',
            price:'12.90',
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
        prizes_list: rewards,
        img:'GuacBacon.jpg'
        })
    });

module.exports = Router;