const Express = require('express');
const Router = Express.Router();
const Menu = require('../../models/Menu');
const {isLoggedIn, isNotLoggedIn, isAdmin} = require('../../utilities/account_checker');


//Create Menu items
Router.get('/create', async function(req, res){
	res.render('menu/createMenu', {})
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
            const createMenu = await Menu.create({
                item_name: req.body.Name,
                item_price: req.body.Price,
                item_course: req.body.Course,
                item_description: req.body.Description
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
            attributes: ['item_name', 'item_price', 'item_course', 'item_description'],
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
        const menu = await Menu.findOne({ where: { item_name: req.params.item_name } });
        return res.render('menu/updateMenu', {
            item_name: req.params.item_name,
            item_price: menu.item_price,
            item_course: menu.item_course,
            item_description: menu.item_description,
            uuid: menu.uuid
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
            const updateMenu = await Menu.update({
                item_name: req.body.item_name,
                item_price: req.body.item_price,
                item_course: req.body.item_course,
                item_description: req.body.item_description
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
            item_price: menu.item_price,
            item_course: menu.item_course,
            item_description: menu.item_description,
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