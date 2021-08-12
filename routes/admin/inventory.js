const Express = require('express');
const Router = Express.Router();
const { Sequelize, Op } = require('sequelize');
const Cron = require('node-cron');

const {Supplies} = require('../../models/Supplies');
const {SupplyCategory} = require('../../models/SupplyCategory');
const {SupplyPerformance} = require('../../models/SupplyPerformance');
const Menu = require('../../models/Menu');
const { arrange_supplies_menu_checkbox, arrange_supplies_by_food_weekNo } = require('../../utilities/functions');

// REQUEST routes
Router.get('/create/supplyItem', async function(req, res) {
    console.log('Create supply item page accessed');
    try {
        const supplies = await Supplies.findAll({
            attributes:['item_name'],
            raw: true
        });

        const categories = await SupplyCategory.findAll({
            attributes:['category_no', 'category_name'],
            raw: true
        });

        return res.render('inventory/createSupply', {
            supplies_dict : supplies,
            categories: categories, 
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

    // Creating new supply item
    try {
        const supply = await Supplies.create({
            item_name: req.body.name,
            category_no: req.body.type,
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
    let view_id = req.query.selectedItem;
    let filter_item = {};

    // For accessing the page directory, where query is not set
    if (view_id == undefined) {
        // Get 1st item id (For accessing the page straight)
        try {
            filter_item = await Supplies.findOne({
                attributes:['item_id'],
                order:[['item_name', 'ASC']],
                raw: true
            });
            view_id = filter_item.item_id
            req.query.selectedItem = view_id;
        }
        catch (TypeError) {
            console.error("Supplies list is empty");
        }
    }
    else {
        filter_item = {};
        filter_item.item_id = view_id;
    }
    
    let items, all_items_names, sorted_graph_data = [];
    console.log(filter_item);
    if (filter_item != null) {
        // Get 1st graph data
        items = await Supplies.findAll({
            include: [{
                model: SupplyPerformance,
                attributes: ['week_no', 'stock_used'],
                order: [['week_no', 'ASC']],
                where: filter_item,
            }],
            attributes: ['item_id', 'item_name'],
            order: [['item_name', 'ASC']],
            raw: true
        });
        // Get names of all supplies
        all_items_names = await Supplies.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('item_name')), 'item_name'], 'item_id'],
            order: [['item_name', 'ASC']],
            raw: true
        });
        // Sorted in the right format for graph to use
        sorted_graph_data = arrange_supplies_by_food_weekNo(items);
    }

    return res.render('inventory/suppliesDashboard', {
        graph_data: sorted_graph_data,
        all_names: all_items_names,
        view_item: sorted_graph_data.name
    });
});

Router.get('/suppliesList', async function(req, res) {
    return res.render('inventory/retrieveSupplies', {});
});
// Delete operation on supply item
Router.post('/suppliesList/:id', async function(req, res) {
    console.log("Deleting supply item")
    try {
        const delItem = await Supplies.destroy({
            where: {item_id: req.params.id}
        });

        return res.redirect('/admin/inventory/suppliesList');
    }
    catch (error) {
        console.error(`An error occurred trying to delete item ${req.params.id}`);
        console.error(error);
    }
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

Router.get('/viewSuppliesOrder', async function(req, res) {
    // Checks if the current timing allows you to make changes to predicted value
    try {
        const set_orders = await Supplies.findOne({
            attributes: ['next_value']
        });
        var allow_change = false;
        if (set_orders.next_value != null) {
            allow_change = true;
        }
    }
    catch (TypeError) {
        console.error("Supplies is still empty");
    }

    return res.render('inventory/submittedSupplies', {
        allow_change: allow_change
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
    const getPage = parseInt(req.query.page);
    const getSize = parseInt(req.query.size);
    const filterSearch = req.query.search;

    const condition = {
        [Op.or]: {
            "uuid": { [Op.substring]: filterSearch} ,
            "email": { [Op.substring]: filterSearch} ,
            "name": { [Op.substring]: filterSearch} ,
            "role": { [Op.substring]: filterSearch}
        }
    }

    const totalFound = await User.count({
        where: condition
    })

    let page = 0;
    let size = 10;
    if (!Number.isNaN(getPage) && getPage > 0) {
        page = getPage;
    }
    if (!Number.isNaN(getPage) && 0 < getPage < 10) {
        size = getSize;
    }

    //const results;
    try {
        const list_data = await Supplies.findAll({
            include: [{
                model: SupplyCategory,
                attributes: ['category_name']
            },
            {
                model: SupplyPerformance,
                attributes: ['stock_used', 'current_stock_lvl'],
                where: {week_no:1}
            }],
            attributes:['item_name'],
            //limit: size,
            //offset: page*size,
            raw: true
        });
        console.log(list_data);

        return res.json({
            rows: list_data
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
                    attributes: ['category_name']
                },
            ],
            attributes:['item_name', 'item_id', 'next_value'],
            raw: true
        });
        console.log(list_data);

        return res.json({
            rows: list_data,
        });
    }
    catch (error) {
        console.error("Error retrieving the data for generating tables");
        console.error(error);
    }
});

async function set_predicted_value() {
    function cal_change_val(weeks) {
        var info = {}
        var change_val = 0
        const weightages = [0.5, 0.3, 0.15, 0.05]
        for (w=0; w< weeks.length; w++) {
            change_val += (weeks[w+1] - weeks[w]) * weightages[w]
        }
        info['changed_value'] = change_val += Math.round(change_val*-0.01);
        info['change_percentage'] = ((change_val / weeks[0]) * 100).toFixed(5);
        return info;
    }

    const all_items_wks = await SupplyPerformance.findAll({
        include:[{
            model: SupplyPerformance,
            attributes: ['item_id', 'week_no', 'stock_used'],
            order:[['week_no', 'ASC']],
        }],
        attributes: [['item_name', 'item_name']],
        order: [['item_name', 'ASC']],
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
        const update = await Supplies.update({
            val_change: info_dict.changed_value,
            next_value: info_dict.change_percentage
        }, {where: {item_id: item}});
    }
}

// Setting final value of supplies order and resetting current week every Monday 12.00am
const finalizingUpdate = Cron.schedule('* 0 * * Mon', async function(req, res) {
    // Calculate the stock level for new week
    set_predicted_value();
    // Shifting all items week up by 1 (Stores up to 5 weeks only)
    try {
        const remove_highest = await SupplyPerformance.destroy({ where: { week_no: 5 } });
        const up_week_all = await SupplyPerformance.increment('week_no');
    }
    catch (error) {
        console.error("An error occurred trying to shift all items week up a level");
        console.error(error);
    }

    // Actions to initialize new week values
    const all_items = await Supplies.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('item_id')), 'item_id'], 'item_name', 'ingredients_list']
    });
    
    for (var item in all_items) {
        // Initialise new week items with no stock value (Stock level set at 2.59pm - Orders made between uses week 2 stock level) 
        const new_week = await SupplyPerformance.create({
            item_id: all_items.item_id,
        });
    }
    
}, {
    scheduled: true,
    timezone: "Asia/Singapore"
});
// Schedule for update of supplies weeks every Monday 6.59 pm
const scheduleUpdate = Cron.schedule('59 59 6 * * Mon', async function(req, res) {
    // Set stock level to the amount specified in SupplyPerformance
    const set_orders = await Supplies.findAll({
        attributes: ['item_id', 'next_value']
    });
    for (var item in set_orders) {
        const set_stock_lvl = await SupplyPerformance.update({
            current_stock_level: set_orders[item].next_value
        }, { where: { 
                item_id: set_orders[item].item_id, week_no: 1 
            } 
        });
    }
    // Reset next_value to indicate no changes to be allowed
    const set_orders_null = await SupplyPerformance.update({
        next_value: null
    });
}, {
    scheduled: true,
    timezone: "Asia/Singapore"
});
scheduleUpdate.start();
finalizingUpdate.start();

module.exports = Router;
