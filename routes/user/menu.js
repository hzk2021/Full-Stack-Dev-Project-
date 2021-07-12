const Express = require('express');
const Router = Express.Router();
const {UserRewards} = require('../../models/UserRewards');
const Menu = require('../../models/Menu');
const Cart = require('../../models/Order');

//Retrieve
Router.get('/', async function(req, res){
    console.log("Public menu page accessed");
    const items = null;
    try {
        // Get all menu items
        const items = await Menu.findAll({
            attributes: ['item_name', 'item_price', 'item_course', 'item_description'],
            raw: true
        });
        console.log(items);        
    }

    catch (error) {
        console.error("An error occured while trying to retrieve the menu items");
        console.error(error);
        return res.status(500).end();
    }
    // Below is for rewards
    // Get user rewards
    const rewards =  null;
    try {
        rewards = UserRewards.findAll({where:{uuid:req.user.uuid}});
    }
    catch (error) {
        console.error("User is not logged in");
    }
    res.render('menu/menuPublic', {
            items: items,
            prizes_list: rewards,
            }) ;
    });

module.exports = Router;
