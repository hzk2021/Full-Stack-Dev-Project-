const Express = require('express');
const Router = Express.Router();
const { Sequelize, Op } = require('sequelize');

const {Supplies} = require('../models/Supplies');
const {SupplyCategory} = require('../models/SupplyCategory');
const {SupplyPerformance} = require('../models/SupplyPerformance');
const { arrange_supplies_by_food_weekNo, arrange_supplies_by_food_weekNo_full } = require('../utilities/functions');
const {isSupplier} = require('../utilities/account_checker');

Router.get('/create/supplyItem', isSupplier, async function(req, res) {
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
            success_msg: req.flash('success_msg'),
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

Router.post('/create/supplyItem', isSupplier, async function(req, res) {
    // Check if item already existed
    const find_item = await Supplies.findOne({ where: {item_name: req.body.name} });
    if (find_item != null) {
        req.flash("error", "Supply item already existed");
        return res.redirect('/supplier/create/supplyItem');
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
        return res.status(500).end();
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
        return res.status(500).end();
    }

    return res.redirect('/supplier/create/supplyItem');
});

Router.get('/edit/categories', isSupplier, async function(req, res) {
    try {
        console.log("Edit supply categories page accessed");
        const categories = await SupplyCategory.findAll({ raw: true });
        const highest = await SupplyCategory.max('category_no');
        return res.render('inventory/manageCategories', {
            categories:categories,
            length: highest,
            error: req.flash('error'),
            errors: req.flash('errors') 
        });
    }
    catch (error){
        console.error("Error retrieving all categories");
        console.error(error);
        return res.status(500).end();
    }
});

Router.post('/edit/categories', isSupplier, async function(req, res) {
    console.log(req.body);
    try {
        console.log('POST edit categories');
        // Get the current list of categories
        const category_max = await SupplyCategory.max('category_no');
        const category_amt = await SupplyCategory.findAndCountAll({attributes: ['category_no'], raw:true});
        console.log(category_amt);

        // Check for duplicate values
        var inp_values = Object.values(req.body);
        var checked_values = [];
        for (var i in inp_values) {
            if (checked_values.includes(inp_values[i])) {
                req.flash("error", "Category entries should not have duplicates");
                return res.redirect('/supplier/edit/categories');
            }
            else {
                checked_values.push(inp_values[i]);
            }
        }
        // Create/Update existing categories
        for (var i in req.body) {
            var inp = req.body[i];
            // While inputs parsed less than the total in db, do update
            if (i <= category_max) {
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
        if (Object.keys(req.body).length < category_amt.count) {
            var all_inp = Object.keys(req.body);
            var all_cat = category_amt.rows.map(x => x.category_no.toString());
            console.log(all_inp);
            console.log(all_cat);
            // Identifying keys that do not exist anymore
            for (var cat in all_cat) {
                if (!all_inp.includes(all_cat[cat])) {
                    try {
                        const delCat = await SupplyCategory.destroy({
                            where: { category_no: all_cat[cat] }
                        });
                    }
                    catch (error) {
                        console.error("Error deleting categories");
                        console.error(error);
                        return res.status(500).end();
                    }
                }
            }
        }

        return res.redirect('/supplier/suppliesList');
    }
    catch (error) {
        console.log('Error in insert/update/delete items from db');
        console.error(error);
        return res.status(500).end();
    }
});

Router.get('/suppliesList', isSupplier, async function(req, res) {
    return res.render('inventory/retrieveSupplies', {success_msg: req.flash('success_msg'),});
});
// Delete operation on supply item
Router.post('/suppliesList/:id', isSupplier, async function(req, res) {
    console.log("Deleting supply item")
    try {
        const delItem = await Supplies.destroy({
            where: {item_id: req.params.id}
        });

        return res.redirect('/supplier/suppliesList');
    }
    catch (error) {
        console.error(`An error occurred trying to delete item ${req.params.id}`);
        console.error(error);
        return res.status(500).end();
    }
});

Router.get('/update/:id', isSupplier, async function(req, res) {
    try {
        let item = await Supplies.findOne({
            attributes:['item_name', 'category_no', 'next_value', 'changes_lock'],
            where: { item_id:req.params.id },
            raw: true
        });
        if (item.changes_lock == true) {
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

Router.post('/update/:id', isSupplier, async function(req, res) {
    console.log("Updating supply item");
    let next_value = null;
    // Validate invalid inputs
    if (!Number.isInteger(req.body.quantity) && req.body.quantity != null) {
        req.flash("error", `Next value must be an integer`);
        return res.redirect('/supplier/update/'+req.params.id);
    }
    const existingItem = await Supplies.findOne({ where: {item_name:req.body.name} });
    if (existingItem != null) {
        req.flash("error", `Item already existed!`);
        return res.redirect('/supplier/update/'+req.params.id);
    }

    // Set next value
    if (req.body.quantity != null) {
        next_value = parseInt(req.body.quantity);
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
        return res.status(500).end();
    }

    return res.redirect('/supplier/suppliesList');
});

Router.get('/viewOrder', isSupplier, async function(req, res) {
    // Checks if the current timing allows you to make changes to predicted value
    const set_orders = await Supplies.findOne({
        attributes: ['changes_lock']
    });
    if (set_orders == null) {
        return res.render('inventory/submittedSupplies', {});
    }
    else {
        const date_submitted = await SupplyPerformance.findOne({
            attributes: ['date_submitted'],
            where: {week_no: 1}
        });
        var display_date = date_submitted;
        console.log(display_date);
        if (display_date.date_submitted != null) {
            display_date = date_submitted.date_submitted.toISOString().substring(0, 16).replace("T", ",");
        }
        return res.render('inventory/submittedSupplies', {
            allow_change: set_orders.changes_lock,
            date_submitted: display_date
        });
    }
});

Router.get('/get-data', async function(req, res) {
    console.log('Retrieving data for supplies table');
    if (req.user.role == "admin" || req.user.role == "supplier") {
        const filterSearch = req.query.search;
        try {
            const list_data = await Supplies.findAll({
                include:[{
                    model: SupplyCategory,
                    attributes: ['category_name']
                },
                {
                    model: SupplyPerformance,
                    attributes: ['stock_used', 'current_stock_lvl'],
                }],
                attributes:['item_name'],
                order: [['item_name', 'DESC']],
                limit: parseInt(req.query.limit),
                offset: parseInt(req.query.offset),
                where: {
                    "$supply_performances.week_no$": 1,
                    [Op.or]: {
                        item_name: { [Op.substring]: filterSearch},
                        "$supply_performances.stock_used$": { [Op.substring]: filterSearch},
                        "$supply_performances.current_stock_lvl$": { [Op.substring]: filterSearch},
                        "$supply_category.category_name$": { [Op.substring]: filterSearch}
                    }
                },
                subQuery: false,
                raw: true
            })
            console.log(list_data);

            return res.json({
                rows: list_data
            });
        }
        catch (error) {
            console.error("Error retrieving the data for generating tables");
            console.error(error);
            return res.status(500).end();
        }
    }
    else {
        return res.status(403).end();
    }
});

Router.get('/get-supplies', async function(req, res) {
    console.log('Retrieving data for supplies list');
    if (req.user.role == "admin" || req.user.role == "supplier") {
        const filterSearch = req.query.search;
        // Checks if the current timing allows admin to make changes to predicted value
        const changes_lock = await Supplies.findOne({
            attributes: ['changes_lock']
        });
        
        let list_data;
        try {
            if ((req.user.role == "supplier" && changes_lock.changes_lock == true) || 
            (req.user.role == "admin" && changes_lock.changes_lock == false)) {
                console.log("Running scenario 1")
                list_data = await Supplies.findAll({
                    include: [{
                        model: SupplyCategory,
                        attributes: ['category_name']
                    }],
                    attributes: ['item_name', 'item_id'],
                    limit: parseInt(req.query.limit),
                    offset: parseInt(req.query.offset),
                    where: {
                        [Op.or]: {
                            item_name: { [Op.substring]: filterSearch},
                            item_id: { [Op.substring]: filterSearch},  
                            "$supply_category.category_name$": { [Op.substring]: filterSearch}
                        }
                    },
                    subQuery: false,
                    raw: true
                });
            }
            else {
                console.log("Running scenario 2")
                list_data = await Supplies.findAll({
                    include: [{
                        model: SupplyCategory,
                        attributes: ['category_name']
                    }],
                    attributes: ['item_name', 'item_id', 'next_value'],
                    limit: parseInt(req.query.limit),
                    offset: parseInt(req.query.offset),
                    where: {
                        [Op.or]: {
                            item_name: { [Op.substring]: filterSearch},
                            item_id: { [Op.substring]: filterSearch}, 
                            next_value: { [Op.substring]: filterSearch}, 
                            "$supply_category.category_name$": { [Op.substring]: filterSearch}
                        }
                    },
                    subQuery: false,
                    raw: true
                });
            }

            return res.json({
                rows: list_data,
            });

        }
        catch (error) {
            console.error("Error retrieving the data for generating tables");
            console.error(error);
            return res.status(500).end();
        }
    }
    else {
        return res.status(403).end();
    }
});

module.exports = Router;
