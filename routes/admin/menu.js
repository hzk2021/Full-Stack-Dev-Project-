const Express = require('express');
const Router = Express.Router();
const { Sequelize, Op } = require('sequelize');
const {Menu} = require('../../models/Menu');
const {MenuCategory} = require('../../models/MenuCategory');
const { arrange_supplies_menu_checkbox } = require('../../utilities/functions');

// Menu Items ---------------------------------------------------------------------------------------------------

//Create Menu items
Router.get('/create', async function(req, res){
    try {
        // Inventory: Get all supplies in the right format
        const checkboxes_list = await arrange_supplies_menu_checkbox();

        const categories = await MenuCategory.findAll({
            attributes:['category_no', 'category_name'],
            raw: true
        });
        res.render('menu/createMenu', { 
            checkboxes_list: checkboxes_list,
            categories:categories
        });
    }
    catch (error) {
        console.log("Error fetching supplies or menu categories");
        console.log(error);
    }
});

Router.post('/create', async function(req, res){
    console.log("Create Menu page accessed");
    try {
        let errors = []
        if (isNaN(req.body.Price)){
            errors = errors.concat({text: "Invalid price"})
        }
        if (errors.length > 0){
            console.error(`There are ${errors.length} errors in the form`);
		    return res.render('menu/createMenu', {
			    errors: errors
		    });

        }
        else{
            // Add all checked ingredients to list  
            let listIngredients = [];
            if (typeof(req.body.Ingredients == "string")) {
                listIngredients.push(req.body.Ingredients);
            
            }
            else {
                for (const i of req.body.Ingredients){
                    listIngredients.push(i);
                }
            }

            const createMenu = await Menu.create({
                item_name: req.body.Name,
                item_price: req.body.Price,
                item_description: req.body.Description,
                item_ingredients: listIngredients.toString(),
                category_no: req.body.type
            });
            console.log("Successfully created new menu object");
        }
    }

    catch (error) {
        console.error("An error occured while trying to create the menu item");
        console.error(error);
        return res.status(500).end();
    }
	return res.redirect("/admin/menu"); 
});

//Retrieve Admin Menu
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
        return res.render('menu/menuAdmin', {
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

//Update
Router.get('/update/:item_name', async function(req, res){
    console.log("Update admin menu page accessed");
	try {
        const menu = await Menu.findOne({ where: { item_name: req.params.item_name } })
        const categories = await MenuCategory.findAll({
            attributes: ['category_no', 'category_name'],
            raw: true
        }); 

        // Inventory: Get all supplies in the right format
        const checkboxes_list = await arrange_supplies_menu_checkbox();
        const listIngredients = menu.item_ingredients.split(",");

        console.log("Ingredients for item:", listIngredients);
        console.log("All igredients:", checkboxes_list);
        return res.render('menu/updateMenu', {
            item_name: req.params.item_name,
            item_price: menu.item_price,
            item_description: menu.item_description,
            item_ingredients_list: listIngredients, 
            uuid: menu.uuid,
            checkboxes_list: checkboxes_list,
            categories: categories,
            
        })
    }
    catch (error) {
        console.log("Error fetching " + req.params.item_name + " from menu");
        console.log(error);
    }
});

Router.post('/update/:item_name', async function (req, res) {    
    try {
        let errors = []
        if (isNaN(req.body.item_price)){
            errors = errors.concat({text: "Invalid price when updating Item: " + req.body.item_name})
        }
        if (errors.length > 0){
            console.error(`There are ${errors.length} errors in the form`);
		    return res.render('menu/menuAdmin', {
			    errors: errors
		    });

        }
        else {
            // Add all checked ingredients to list  
            let listIngredients = [];
            if (typeof(req.body.Ingredients == "string")) {
                listIngredients.push(req.body.Ingredients);
            
            }
            else {
                for (const i of req.body.Ingredients){
                    listIngredients.push(i);
                }
            }
            const updateMenu = await Menu.update({
                item_name: req.body.item_name,
                item_price: req.body.item_price,
                item_description: req.body.item_description,
                item_ingredients: listIngredients.toString(),
                category_no: req.body.category_no,
            }, { where:{ uuid: req.body.uuid}});
            
            console.log("Successfully updated menu object");
        }
    }
    catch (error) {
        console.error("An error occured while trying to update the menu item");
        console.error(error);
        return res.status(500).end();
    }


    return res.redirect("/admin/menu");
});

// Delete
Router.get('/delete/:item_name', async function(req, res){
    console.log("Delete admin menu page accessed");
	try {
        const menu = await Menu.findOne({ where: { item_name: req.params.item_name } });
        return res.render('menu/deleteMenu', {
            item_name: req.params.item_name,
            uuid: menu.uuid
        })
    }
    catch (error) {
        console.log("Error fetching " + req.params.item_name + " from menu");
        console.log(error);
    }
});

Router.post('/delete/:item_name', async function (req, res) {    
    try {
        const deleteMenu = await Menu.destroy({
             where:{ uuid: req.body.uuid}
            });
        
        console.log("Successfully deleted menu object");
        
        
    }
    catch (error) {
        console.error("An error occured while trying to delete the menu item");
        console.error(error);
        return res.status(500).end();
    }


    return res.redirect("/admin/menu");
});

// Menu Categories ---------------------------------------------------------------------------------------------------

Router.get('/edit/categories', async function(req, res) {
    try {
        console.log("Edit menu categories page accessed");
        const categories = await MenuCategory.findAll({ raw: true });
        const highest = await MenuCategory.max('category_no');
        return res.render('menu/manageCategories', {
            categories:categories,
            length: highest
        });
    }
    catch {
        console.error("Error retrieving all categories");
    }
});

Router.post('/edit/categories', async function(req, res) {
    console.log(req.body);
    try {
        console.log('POST edit categories');
        // Get the current list of categories
        const category_max = await MenuCategory.max('category_no');
        const category_amt = await MenuCategory.findAndCountAll({attributes: ['category_no'], raw:true});
        console.log(category_amt);

        // Create/Update existing categories
        for (var i in req.body) {
            var inp = req.body[i];
            // While inputs parsed less than the total in db, do update
            if (i <= category_max) {
                const updateCat = await MenuCategory.update({
                    category_name: inp
                }, { where: {category_no: i}});
            }
            // Inputs parsed is more than db, do create
            else {
                const addCat = await MenuCategory.create({
                    category_no: i,
                    category_name: inp
                });
            }
        }
        // Delete categories (If all inputs is less than db)
        if (Object.keys(req.body).length < category_amt.count) {
            var all_inp = Object.keys(req.body);
            var all_cat = category_amt.rows.map(x => x.category_no.toString());
            console.log(all_inp);
            console.log(all_cat);
            // Identifying keys that do not exist anymore
            for (var cat in all_cat) {
                if (!all_inp.includes(all_cat[cat])) {
                    const delCat = await MenuCategory.destroy({
                        where: { category_no: all_cat[cat] }
                    });
                }
            }
        }

        return res.redirect('/admin/menu');
    }
    catch (error) {
        console.log('Error in insert/update/delete items from db');
        console.error(error);
    }
})

module.exports = Router;
