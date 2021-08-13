const Express = require('express');
const Router = Express.Router();
const Menu = require('../../models/Menu');
const { arrange_supplies_menu_checkbox } = require('../../utilities/functions');

//Create Menu items
Router.get('/create', async function(req, res){
    // Inventory: Get all supplies in the right format
    const checkboxes_list = await arrange_supplies_menu_checkbox();
	res.render('menu/createMenu', { checkboxes_list: checkboxes_list});
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
                item_course: req.body.Course,
                item_description: req.body.Description,
                item_ingredients: listIngredients.toString(),
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
            attributes: ['item_name', 'item_price', 'item_course', 'item_description', 'item_ingredients'],
            raw: true
        });
        console.log(items);        
        return res.render('menu/menuAdmin', {
            items: items
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

        // Inventory: Get all supplies in the right format
        const checkboxes_list = await arrange_supplies_menu_checkbox();
        const listIngredients = menu.item_ingredients.split(",");

        console.log("Ingredients for item:", listIngredients);
        console.log("All igredients:", checkboxes_list);
        return res.render('menu/updateMenu', {
            item_name: req.params.item_name,
            item_price: menu.item_price,
            item_course: menu.item_course,
            item_description: menu.item_description,
            item_ingredients_list: listIngredients, 
            uuid: menu.uuid,
            checkboxes_list: checkboxes_list
            
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
                item_course: req.body.item_course,
                item_description: req.body.item_description,
                item_ingredients: listIngredients.toString(),
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

module.exports = Router;
