const Express = require('express');
const Router = Express.Router();
const { Sequelize } = require('sequelize');
// const Ingredients = require('../../models/CalSupplies');
const {Supplies} = require('../../models/Supplies');
const {SupplyCategory} = require('../../models/SupplyCategory');
const {SupplyPerformance} = require('../../models/SupplyPerformance');
const Menu = require('../../models/Menu');
const { arrange_supplies_menu_checkbox, arrange_supplies_by_food_weekNo } = require('../../utilities/data_arranger');

// REQUEST routes
Router.get('/create/supplyItem', async function(req, res) {
    try {
        const supplies = await Supplies.findAll({
            attributes:['item_name'],
            raw: true
        });

        const categories = await SupplyCategory.findAll({
            attributes:['category_no', 'category_name'],
            raw: true
        });

        // Get list of menu arranged by their respective categories and for display in form checkbox
        const sorted_food = arrange_supplies_menu_checkbox();

        console.log(categories);
        return res.render('inventory/createSupply', {
            supplies_dict : supplies,
            categories: categories,
            food_list: sorted_food
        });
    }
    catch (error) {
        console.error("There is error retrieving supplies list");
        console.error(error);
    }
});

// RESPONSE routes
Router.post('/create/supplyItem', async function(req, res) {
    var inputs_counter = 0

    // Check if item already existed
    const find_item = await Supplies.findOne({ where: {item_name: req.body.name} });
    if (find_item != null) {
        return res.render('inventory/createSupply', {error: "Supply item already existed"});
    }

    var db_string;
    // Formatting selected dishes into string format for storing in db
    for (var inp in req.body) {
        // Prevent checking of name and category inputs
        inputs_counter += 1
        if (inputs_counter <= 2) {
            break
        }
        if (inputs_counter != 3) {
            db_string += ","
        }
        db_string += req.body[inp]
    }
    console.log(db_string);
    // Creating new supply item
    try {
        const supply = await Supplies.create({
            item_name: req.body.name,
            category_no: req.body.type,
            food_list: db_string
        });
    }
    catch(error) {
        console.error("Error creating supply item");
        console.error(error);
        return res.render('inventory/createSupply', {error:"An error occurred creating supply item"});
    }
    console.log("New supply item has been created");

    // Creating a performance record within Supplies Performance
    const new_item_id = await Supplies.findOne({
         where:{item_name: req.body.name},
         attributes: ['item_id'] 
    });
    try {
        const supplyPerformance = await SupplyPerformance.create({
            item_id: new_item_id.item_id
        });
    }
    catch (error) {
        console.error("Error creating supply item performance object");
        console.error(error);
        return res.render('inventory/createSupply', {error:"An error occurred creating supply item for the performance model"});
    }

    return res.redirect('/admin/inventory/create/supplyItem');
});

Router.get('/edit/categories', async function(req, res) {
    try {
        console.log("Edit categories page accessed");
        const categories = await SupplyCategory.findAll({
            attributes: ['category_name'],
            raw: true
        });
        return res.render('inventory/manageCategories', {categories:categories});
    }
    catch {
        console.error("Error retrieving all categories");
    }
});

Router.post('/edit/categories', async function(req, res) {
    try {
        console.log('POST edit categories');
        // Get the current list of categories
        const categories = await SupplyCategory.findAll({
            attributes: ['category_name'],
            order: [['category_no', 'ASC']],
            raw: true
        });

        // Updating existing categories
        var req_i = 1
        var i = 0;
        for (i=0; i<categories.length; i++) {
            while (req.body['name'+req_i] == null) {
                req_i++;
            }
            if (categories[i].category_name != req.body['name'+req_i]) {
                const updateCat = await SupplyCategory.update({
                    category_name: req.body['name'+req_i]             
                }, { where: {category_no:i} });
            }
            req_i++;
        }
        
        // Creating new categories
        try {
            var new_input_first = req.body['name'+req_i]
            for (req_i; req_i< Object.keys(req.body).length+1; req_i++) {
                if (req.body['name'+req_i] != "") {
                    const createCat = await SupplyCategory.create({
                        category_no: i+1,
                        category_name: req.body['name'+req_i]
                    });
                    i++;
                }
            }
        }
        catch (error) {
            console.log(error);
            console.log("All update functions has been completed");
        }

        return res.redirect('/admin/inventory/dashboard');
    }
    catch (error) {
        console.log('Error retrieving list of categories');
        console.error(error)
    }
})

Router.get('/dashboard', async function(req, res) {
    console.log("Admins supplies dashboard accessed");
    const all_data = await Supplies.findAll({
        attributes: ['item_id', 'week_no', 'stock_used'],
        order:[['item_name', 'ASC'], ['week_no', 'ASC']],
        raw: true
    });
    
    let sorted_graph_data = {}
    try {
        sorted_graph_data = arrange_supplies_by_food_weekNo(all_data);
    }
    catch (TypeError) {
        console.error(`Error: Supplies is still empty`);
    }

    return res.render('inventory/retrieveSupplies', {
        /*all_data: {"Supplies":{Bun:4012, Chicken:2134, Beef:2987, Lettuce:3412}, 
                    "5th Week":{Bun:3964, Chicken:2456, Beef:3600, Lettuce:3912},
                    "4th Week":{Bun:4215, Chicken:2742, Beef:3461, Lettuce:4132},
                    "3rd Week":{Bun:4002, Chicken:2514, Beef:3265, Lettuce:3712},
                    "2nd Week":{Bun:3814, Chicken:2223, Beef:2871, Lettuce:3402}
                   },*/
        all_data: sorted_graph_data,
        supplies_dict: [{name:"Bun", type:"Others", qty:4012, valChange:5.19, nextVal:4136}, 
                        {item_id:"61db7439-87bc-4924-8eca-1bb15fb57720", name:"Chicken", type:"Meat", qty:2132, valChange:-4.00, nextVal:2019}, 
                        {item_id:"5135618d-f32b-482a-a993-846273d7446d", name:"Beef", type:"Meat", qty:2987, valChange:4.04, nextVal:2900},
                        {name:"Lettuce", type:"Vegetables", qty:3412, valChange:0.35, nextVal:3328}
                        ],
        view_item: "Chicken"
    });
});

Router.get('/update/:id', async function(req, res) {
    try {
        const item = await Supplies.findOne({
            
            attributes:['item_name', 'category_no'],
            where: { item_id:req.params.id },
            raw: true
        });

        const categories = await SupplyCategory.findAll({
            attributes:['category_no', 'category_name'],
            raw: true
        });

        // Indicate the selected value
        for (var cat in categories) {
            if (categories[cat].category_no == item.category_no) {
                categories[cat].selected = true
            }
        }
        console.log(categories);

        // Get list of menu arranged by their respective categories and for display in form checkbox
        const sorted_food = await arrange_supplies_menu_checkbox();
        return res.render('inventory/updateSupply', {
            item: item,
            categories: categories,
            food_list: sorted_food
        });
    }
    catch (error) {
        console.error("There is error retrieving supplies list");
        console.error(error);
    }
});

Router.post('/update/:id', async function(req, res) {
    let next_value = null
    if (req.body.quantity != "") {
        next_value = req.body.quantity
    } 
    try {
        const item = await Supplies.update({
            item_name: req.body.name,
            category_no: req.body.type,
            next_value: next_value
        }, { where: {item_id: req.params.id } })
    }
    catch (error) {
        console.error("An error occured trying to update the item");
        console.error(error);
    }

    return res.redirect('/admin/inventory/dashboard');
});

Router.get('/suppliesList', async function(req, res) {
    try {
        const list_data = await Supplies.findAll({
            include: [
                {
                    model: SupplyCategory,
                    attributes: ['category_name']
                },
                {
                    model: SupplyPerformance,
                    attributes: ['next_value']
                }
            ],
            attributes:['item_name'],
            where: {week_no:1},
            offset: parseInt(req.query.offset),
            limit: parseInt(req.query.limit),
            raw: true
        });
        console.log(list_data);

        return res.render({
            "rows": list_data
        });
    }
    catch (error) {
        console.error("Error retrieving the data for generating tables");
        console.error(error);
    }
});

Router.get('/viewSuppliesOrder', async function(req, res) {
    return res.render('inventory/submittedSupplies', {
        next_value_dict: {Bun:4136, Chicken:2019, Beef:2900, Lettuce:3328}
    });
});

Router.get('/test', async function(req, res) {
    return res.render('inventory/test');
});

Router.post('/test', async function(req, res) {
    for (var i in req.body) {
        console.log(req.body[i]);
    }
    res.redirect('/admin/inventory/test');
})

Router.get('/get-data', async function(req, res) {
    console.log('Retrieving data for supplies table');
    const searchInput = req.query.search;
    //const results;
    try {
        const list_data = await Supplies.findAll({
            include: [
                {
                    model: SupplyCategory,
                    attributes: ['category_name'],
                },
                {
                    model: SupplyPerformance,
                    attributes: ['val_change', 'next_value']
                }
            ],
            attributes:['item_name', 'stock_used', 'current_stock_lvl', 'category_no'],
            where: {week_no:1},
            offset: parseInt(req.query.offset),
            limit: parseInt(req.query.limit),
            raw: true
        });
        console.log(list_data);

        return res.json({
            "rows": list_data
        });
    }
    catch (error) {
        console.error("Error retrieving the data for generating tables");
        console.error(error);
    }

});

Router.get('/get-supplies', async function(req, res) {
    console.log('Retrieving data for supplies list');
    try {
        const list_data = await Supplies.findAll({
            include: [
                {
                    model: SupplyCategory,
                    attributes: ['category_name'],
                },
            ],
            attributes:['item_name'],
            where: {week_no:1},
            offset: parseInt(req.query.offset),
            limit: parseInt(req.query.limit),
            raw: true
        });
        console.log(list_data);

        return res.json({
            "rows": list_data
        });
    }
    catch (error) {
        console.error("Error retrieving the data for generating tables");
        console.error(error);
    }
});

Router.get('/calculate-next-values', async function(req, res) {
    function cal_change_val(weeks) {
        var info = {}
        var change_val = 0
        const weightages = [0.5, 0.3, 0.15, 0.05]
        for (w=0; w< weeks.length; w++) {
            change_val += (weeks[w+1] - weeks[w]) * weightages[w]
        }
        info['changed_value'] = change_val += Math.round(change_val*-0.01);
        info['change_percentage'] = ((change_val / weeks[0]) * 100).toFixed(5);
    }

    const all_items_wks = await Supplies.findAll({
        attributes: ['item_id', 'week_no', 'stock_used'],
        order:[['item_name', 'ASC'], ['week_no', 'ASC']],
        raw: true
    });

    // Arrange them in format of {food_name: [week1, week2, ...], ...}
    const supplies_weeks = await arrange_supplies_by_food_weekNo(all_items_wks);
    let change_dict = {};
    // Calculate the predicted values for next orders
    for (var item in supplies_weeks) {
        change_dict[item] = cal_change_val(supplies_weeks[item]);
    }
    for (var item in change_dict) {
        info_dict = change_dict[item]
        const update = await SupplyPerformance.update({
            val_change: info_dict.changed_value,
            next_value: info_dict.change_percentage
        }, {where: {item_id: item}});
    }

    return res.redirect('/admin/inventory/dashboard');
});

module.exports = Router;
