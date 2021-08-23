const Express = require('express');
const Router = Express.Router();
const { Sequelize, Op } = require('sequelize');
const Cron = require('node-cron');

const {Supplies} = require('../../models/Supplies');
const {SupplyCategory} = require('../../models/SupplyCategory');
const {SupplyPerformance} = require('../../models/SupplyPerformance');
const { arrange_supplies_by_food_weekNo, arrange_supplies_by_food_weekNo_full } = require('../../utilities/functions');

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
    // Sorted in the right format for graph to use (Function returns array, get index 0)
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

        return res.redirect('/supplies/suppliesList');
    }
    catch (error) {
        console.error(`An error occurred trying to delete item ${req.params.id}`);
        console.error(error);
        return res.status(500).end();
    }
});

Router.get('/viewOrder', async function(req, res) {
    // Checks if the current timing allows you to make changes to predicted value
    const set_orders = await Supplies.findOne({
        attributes: ['changes_lock']
    });
    if (set_orders == null) {
        return res.render('inventory/submittedSupplies', {});
    }
    return res.render('inventory/submittedSupplies', {
        allow_change: set_orders.changes_lock,
        success_msg: req.flash('success_msg')
    });
});

Router.get('/update/:id', async function(req, res) {
    try {
        const item = await Supplies.findOne({
            attributes:['item_name', 'category_no', 'next_value', 'changes_lock'],
            where: { item_id:req.params.id },
            raw: true
        });
        if (item.changes_lock == false) {
            item.next_value = null;
        }

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

        return res.render('inventory/updateSupply', {
            item: item,
            categories: categories,
            role: req.user.role,
            error: req.flash('error'),
            errors: req.flash('errors') 
        });
    }
    catch (error) {
        console.error("There is error retrieving supplies list");
        console.error(error);
        return res.status(500).end();
    }
});

Router.post('/update/:id', async function(req, res) {
    console.log("Updating supply item");
    let next_value = null;
    // Validate invalid inputs
    if (req.body.quantity == null) {
        req.flash("error", `Next value must not be empty`);
        return res.redirect('/admin/inventory/update/'+req.params.id);
    }

    // Set next value
    next_value = parseInt(req.body.quantity);
    try {
        const item = await Supplies.update({
            next_value: next_value
        }, { where: {item_id: req.params.id } })
    }
    catch (error) {
        console.error("An error occured trying to update the item");
        console.error(error);
        return res.status(500).end();
    }

    req.flash("success_msg", `Order value updated successfully!`);
    return res.redirect('/admin/inventory/viewOrder');
});

Router.get('/get-data', async function(req, res) {
    console.log('Retrieving data for supplies table');
    const filterSearch = req.query.search;
    
    var sort_location;
    if (req.query.sort != null && req.query.order != null) {
        if (req.query.sort.includes('supply_category')) {
            var sort_name = req.query.sort.replace('supply_category.', '');
            sort_location = [[SupplyCategory, sort_name, req.query.order]]
        }
        else if (req.query.sort.includes('supply_performances')) {
            var sort_name = req.query.sort.replace('supply_performances.', '');
            sort_location = [[SupplyPerformance, sort_name, req.query.order]]
        }
        else {
            sort_location = [[req.query.sort, req.query.order]]
        }
        
    }
    console.log(sort_location);

    const condition = {
        "$supply_performances.week_no$": 1,
        [Op.or]: {
            item_name: { [Op.substring]: filterSearch},
            "$supply_performances.stock_used$": { [Op.substring]: filterSearch},
            "$supply_performances.current_stock_lvl$": { [Op.substring]: filterSearch},
            "$supply_category.category_name$": { [Op.substring]: filterSearch}
        }
    }

    const totalFound = await Supplies.count({
        include:[{
            model: SupplyCategory,
        },
        {
            model: SupplyPerformance,   
        }],
        where: condition
    });

    try {
        const list_data = await Supplies.findAll({
            include:[{
                model: SupplyCategory,
                attributes: ['category_name'],
            },
            {
                model: SupplyPerformance,
                attributes: ['stock_used', 'current_stock_lvl'],   
            }],
            attributes:['item_name'],
            order: sort_location,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            where: condition,
            subQuery: false,
            raw: true
        });

        return res.json({
            total: totalFound,
            rows: list_data
        });
    }
    catch (error) {
        console.error("Error retrieving the data for generating tables");
        console.error(error);
        return res.status(500).end();
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
        var submitted_date = new Date();
        for (i=1; i<=5; i++) {
            submitted_date.setDate(submitted_date.getDate() - 7);
            var stock_used = Math.floor(Math.random() * 2000) + generated_limit_used;
            var stock_left = Math.floor(Math.random() * 1500) + 10;
            try {
                const createWeek = await SupplyPerformance.create({
                    item_id: all_items[item].item_id,
                    stock_used: stock_used,
                    current_stock_lvl: stock_left,
                    date_submitted: submitted_date.toISOString(),
                    week_no: i
                });
            }
            catch (error) {
                const updateWeek = await SupplyPerformance.update({
                    stock_used: stock_used,
                    current_stock_lvl: stock_left,
                    date_submitted: submitted_date.toISOString()
                }, { where: {week_no: i, item_id: all_items[item].item_id} });
            }
        }
    }
    return res.redirect('/admin/inventory/dashboard');
});

Router.get('/debug-cal-val', async function(req, res) {
    set_predicted_value();
    return res.redirect('/');
});

// Calculate predicted value and store them inside column next_value
async function set_predicted_value() {
    function cal_change_val(weeks) {
        var info = {}
        var change_val = 0
        const weightages = [0.5, 0.3, 0.15, 0.05]
        for (w=0; w< weeks.length-1; w++) {
            change_val += (weeks[w] - weeks[w+1]) * weightages[w]
        }
        info.changed_value = Math.round(change_val) + weeks[0] + change_val*0.01;
        console.log(weeks[0]-weeks[1]);
        info.changed_percentage = ( ((weeks[0]-weeks[1])/ weeks[0]) * 100).toFixed(5);
        if (info.changed_percentage == 'NaN') {
            info.changed_percentage = 0;
        }
        return info;
    }
    console.log("CALCULATING...");
    const all_items_wks = await Supplies.findAll({
        include:[{
            model: SupplyPerformance,
            attributes: ['week_no', 'stock_used'],
            order:[['week_no', 'DESC']],
        }],
        attributes: ['item_id', 'item_name'],
        order: [['item_name', 'ASC']],
        raw: true
    });

    // Arrange them in format of [ {food_name: [week1, week2, ...], ...} ]
    const supplies_weeks = await arrange_supplies_by_food_weekNo_full(all_items_wks);
    console.log(supplies_weeks);
    let change_dict = {};
    // Calculate the predicted values for next orders
    for (var item in supplies_weeks) {
        change_dict[supplies_weeks[item].id] = cal_change_val(supplies_weeks[item].values);
    }
    console.log(change_dict); 
    for (var item in change_dict) {
        info_dict = change_dict[item]
        const update = await Supplies.update({
            val_change: info_dict.changed_percentage,
            next_value: info_dict.changed_value,
        }, {where: {item_id: item}});
    }
}

// Calculate values for next orders, increment the weeks and make a new week
async function finalize_quantity() {
    // Calculate the stock level for new week
    set_predicted_value();
    // Unlocking the lock to allow changes
    try {
        const unlock = await Supplies.update({
            changes_lock: true
        }, { where: {} });
    }
    catch (error) {
        console.error("An error occurred trying to shift all items week up a level");
        console.error(error);
    }
    // Shifting all items week up by 1 (Stores up to 5 weeks only)
    try {
        const remove_highest = await SupplyPerformance.destroy({ where: { week_no: 5 } });
        for (i=4; i>0; i-=1) {
            const up_week_all = await SupplyPerformance.increment('week_no', { where: { week_no: i} });
        }
    }
    catch (error) {
        console.error("An error occurred trying to shift all items week up a level");
        console.error(error);
    }

    // Actions to initialize new week values
    const all_items = await Supplies.findAll({
        attributes: ['item_id', 'item_name'],
    });
    
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
    try {
        for (var item in set_orders) {
            const set_stock_lvl = await SupplyPerformance.increment('current_stock_lvl', {
                by: set_orders[item].next_value,
                where: {
                    item_id: set_orders[item].item_id, 
                    week_no: 1 
                }
            });
        }
        // Lock the table back
        const set_orders_null = await Supplies.update({
            changes_lock: false,
        }, {where: {}});
        // Set date submitted
        const date_submitted = await SupplyPerformance.update({week_no:1}, {where: { week_no: 1 }});
    }
    catch (error) {
        console.error("An error occurred trying to update values");
        console.error(error);
    }

}

Router.get('/debug-finalize-supplies-values', async function(req, res) {
    await finalize_quantity();
    return res.redirect('/');
});

Router.get('/debug-set-supplies-values', async function(req, res) {
    await set_quantity();
    return res.redirect('/');
});

// Setting final value of supplies order and resetting current week every Monday 12.00am
const finalizingUpdate = Cron.schedule('00 00 00 * * Mon', async function(req, res) {
    await finalize_quantity(); 
}, {
    scheduled: true,
    timezone: "Asia/Singapore"
});

// Schedule for update of supplies weeks every Monday 6.59 pm
const setUpdate = Cron.schedule('59 59 6 * * Mon', async function(req, res) {
    await set_quantity();
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
