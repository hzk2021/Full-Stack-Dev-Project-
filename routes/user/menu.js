const Express = require('express');
const Router = Express.Router();
const {UserRewards} = require('../../models/UserRewards');
const {Menu} = require('../../models/Menu');
const {MenuCategory} = require('../../models/MenuCategory');
const {Cart} = require('../../models/Cart');

//Retrieve Public Menu
Router.get('/', async function (req, res) {
    console.log("Admin menu page accessed");
    try {
        // Get all menu items
        const items = await Menu.findAll({
            attributes: ['item_name', 'item_price', 'category_no', 'item_description', 'item_ingredients'],
            raw: true
        });
        // Get all menu categories
        const categories = await MenuCategory.findAll({
            attributes: ['category_no', 'category_name'],
            raw: true
        });

        console.log("items", items);   
        console.log("categories", categories);   
        return res.render('menu/menuPublic', {
            items: items,
            categories:categories
        });
    }

    catch (error) {
        console.error("An error occured while trying to retrieve the menu items");
        console.error(error);
        return res.status(500).end();
    }

    
});

module.exports = Router;