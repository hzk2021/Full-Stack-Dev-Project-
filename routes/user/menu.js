const Express = require('express');
const Router = Express.Router();
const {UserRewards} = require('../../models/UserRewards');
const Menu = require('../../models/Menu');
const Cart = require('../../models/Order');

//Retrieve Public Menu
Router.get('/', async function (req, res) {   
    console.log("Public menu page accessed");
    try {
        // Get all menu items
        const items = await Menu.findAll({
            attributes: ['item_name', 'item_price', 'item_course', 'item_description'],
            raw: true
        });
        console.log(items);        
        return res.render('menu/menuPublic', {
            items: items
        });
    }

    catch (error) {
        console.error("An error occured while trying to retrieve the menu items");
        console.error(error);
        return res.status(500).end();
    }

    
});




module.exports = Router;
