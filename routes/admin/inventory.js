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
        const categories = await SupplyCategory.findAll({ raw: true });
        const highest = await SupplyCategory.max('category_no');
        return res.render('inventory/manageCategories', {
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
        const categories_amt = await SupplyCategory.count({attributes: ['category_no']});
        console.log(categories_amt);

        // Create/Update existing categories
        for (var i in req.body) {
            var inp = req.body[i];
            // While inputs parsed less than the total in db, do update
            if (i <= categories_amt) {
                const updateCat = await SupplyCategory.update({
                    category_name: inp
                }, { where: {category_no: i}});
            }
            // Inputs parsed is more than db, do create
            else {
                const addCat = await SupplyCategory.create({
                    category_no: i,
                    category_name: inp
                });
            }
        }
        // Delete categories (If all inputs is less than db)
        if (Object.keys(req.body).length < categories_amt) {
            var extra_amt = categories_amt - Object.keys(req.body).length;
            var remove_no = categories_amt;
            for (i=0; i<extra_amt; i++) {
                const delCat = await SupplyCategory.destroy({
                    where: { category_no: remove_no }
                });
                remove_no -= 1;
            }
        }

        return res.redirect('/admin/inventory/suppliesList');
    }
    catch (error) {
        console.log('Error in insert/update/delete items from db');
        console.error(error);
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
        filter_item.item_id = view_id;
    }
    
    let items, all_items_names, sorted_graph_data = [];
    // Get graph data
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
    sorted_graph_data = await arrange_supplies_by_food_weekNo(items);

    return res.render('inventory/suppliesDashboard', {
        graph_data: sorted_graph_data[0],
        all_names: all_items_names,
        view_item: sorted_graph_data[0].name
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

Router.get('/get-data', async function(req, res) {
    console.log('Retrieving data for supplies table');
    const getPage = parseInt(req.query.page);
    const getSize = parseInt(req.query.size);
    const filterSearch = req.query.search;

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
                attributes: ['category_name'],
            },
            {
                model: SupplyPerformance,
                attributes: ['stock_used', 'current_stock_lvl'],
                where: { week_no: 1 }
            }],
            attributes:['item_name'],
            where: {
                [Op.or]: {
                    "item_name": { [Op.substring]: filterSearch},
                    "$supply_performances.stock_used$": { [Op.substring]: filterSearch}, 
                    "$supply_performances.current_stock_lvl$": { [Op.substring]: filterSearch},
                    "$supply_category.category_name$": { [Op.substring]: filterSearch},
                }
            },
            order: [['item_name', 'DESC']],
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
    const filterSearch = req.query.search;
    try {
        const list_data = await Supplies.findAll({
            include: [
                {
                    model: SupplyCategory,
                    attributes: ['category_name']
                },
            ],
            attributes: ['item_name', 'item_id', 'next_value'],
            where: {
                [Op.or]: {
                    "item_name": { [Op.substring]: filterSearch},
                    "item_id": { [Op.substring]: filterSearch}, 
                    "next_value": { [Op.substring]: filterSearch},
                    "$supply_category.category_name$": { [Op.substring]: filterSearch}
                }
            },
            raw: true
        });

        return res.json({
            rows: list_data,
        });
    }
    catch (error) {
        console.error("Error retrieving the data for generating tables");
        console.error(error);
    }
});
// Set dummy values for all items
Router.get('/debug-set-random', async function(req, res) {
    const all_items = await Supplies.findAll({attributes: ['item_id']});
    for (var item in all_items) {
        // Generate a range for the stock used (So that values do not deviate too much)
        var generated_limit_used = Math.round( ((Math.random()*5.2)+4.8)*1000 );
        console.log(generated_limit_used);
        // Generate a range for the stock level left
        for (i=1; i<=5; i++) {
            var stock_used = Math.floor(Math.random() * 2000) + generated_limit_used;
            var stock_left = Math.floor(Math.random() * 1500) + 10;
            const updateWeek = await SupplyPerformance.update({
                stock_used: stock_used,
                current_stock_lvl: stock_left
            }, { where: {week_no: i, item_id: all_items[item].item_id} });
        }
    }
    return res.redirect('/admin/inventory/dashboard');
});

Router.get('/debug-cal-val', async function(req, res) {
    set_predicted_value();
    return res.redirect('/');
})

// Calculate predicted value and store them inside column next_value
async function set_predicted_value() {
    function cal_change_val(weeks) {
        var info = {}
        var change_val = 0
        const weightages = [0.5, 0.3, 0.15, 0.05]
        for (w=0; w< weeks.length; w++) {
            change_val += (weeks[w+1] - weeks[w]) * weightages[w]
        }
        info.changed_value = change_val + Math.round(change_val*0.01);
        info.change_percentage = ((change_val / weeks[0]) * 100).toFixed(5);
        return info;
    }
    console.log("CALCULATING...");
    const all_items_wks = await Supplies.findAll({
        include:[{
            model: SupplyPerformance,
            attributes: ['week_no', 'stock_used'],
            order:[['week_no', 'ASC']],
        }],
        attributes: ['item_id', 'item_name'],
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

// Calculate values for next orders, increment the weeks and make a new week
async function finalize_quantity() {
    // Calculate the stock level for new week
    set_predicted_value();
    // Shifting all items week up by 1 (Stores up to 5 weeks only)
    try {
        const remove_highest = await SupplyPerformance.destroy({ where: { week_no: 5 } });
        const up_week_all = await SupplyPerformance.increment('week_no', { where: {} });
    }
    catch (error) {
        console.error("An error occurred trying to shift all items week up a level");
        console.error(error);
    }

    // Actions to initialize new week values
    const all_items = await Supplies.findAll({
        attributes: ['item_id', 'item_name'],
    });
    console.log(all_items);
    
    for (var item in all_items) {
        // Initialise new week items with no stock value (Stock level set at 6.59pm - Orders made between uses week 2 stock level) 
        const new_week = await SupplyPerformance.create({
            item_id: all_items[item].item_id,
        });
    }
}

async function set_quantity() {
    // Set stock level to the amount specified in SupplyPerformance
    const set_orders = await Supplies.findAll({
        attributes: ['item_id', 'next_value'],
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
        next_value: null,
        where: {}
    });
}

Router.get('/debug-finalize-supplies-values', async function(req, res) {
    finalize_quantity();
    return res.redirect('/admin/inventory/dashboard');
});

Router.get('/debug-set-supplies-values', async function(req, res) {
    set_quantity();
    return res.redirect('/admin/inventory/dashboard');
});

// Setting final value of supplies order and resetting current week every Monday 12.00am
const finalizingUpdate = Cron.schedule('* 0 * * Mon', async function(req, res) {
    finalize_quantity(); 
}, {
    scheduled: true,
    timezone: "Asia/Singapore"
});

// Schedule for update of supplies weeks every Monday 6.59 pm
const setUpdate = Cron.schedule('59 59 6 * * Mon', async function(req, res) {
    set_quantity();
}, {
    scheduled: true,
    timezone: "Asia/Singapore"
});
finalizingUpdate.start();
setUpdate.start();

Router.get('/test', async function(req, res) {
    return res.render('inventory/test', {});
})

module.exports = Router;
