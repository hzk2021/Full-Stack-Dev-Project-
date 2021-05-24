const Express = require('express');
const Router = Express.Router();
const Ingredients = require('../../models/Ingredients');
const Supplies = require('../../models/Supplies')

/**
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */

// RESPONSE routes
Router.post('/createSupply', async function(req, res) {
    let errors = [];
    try {
        const name = await Rewards.findOne({where: {name:req.body.name}});
        if (name != null) {
            errors.push({text: "Stock already existed within the inventory"})
        }
        const reward2 = await Rewards.findOne({where: {name2:req.body.name2}});
        if (reward == null) {
            errors.push({text: "2nd Item: Food item not found in menu"})
        }
    }
    catch(error) {
        console.error("Error updating reward item(s)")
        return res.render('rewards/manageRewards')
    }
});

// REQUEST routes
Router.get('/createSupply', async function(req, res) {
    return res.render('inventory/createSupply', {
        supplies_dict : ["Bun", "Chicken", "Beef", "Lettuce"]
    })
});

Router.get('/dashboard', async function(req, res) {
    console.log("Admins supplies dashboard accessed");
    return res.render('inventory/retrieveSupplies', {
        all_data: {"Supplies":{Bun:4012, Chicken:2134, Beef:2987, Lettuce:3412}, 
                    "5th Week":{Bun:3964, Chicken:2456, Beef:3600, Lettuce:3912},
                    "4th Week":{Bun:4215, Chicken:2742, Beef:3461, Lettuce:4132},
                    "3rd Week":{Bun:4002, Chicken:2514, Beef:3265, Lettuce:3712},
                    "2nd Week":{Bun:3814, Chicken:2223, Beef:2871, Lettuce:3402}
                   },
        supplies_dict: [{name:"Bun", type:"Others", qty:4012, valChange:5.19}, 
                        {name:"Chicken", type:"Meat", qty:2132, valChange:-4.00}, 
                        {name:"Beef", type:"Meat", qty:2987, valChange:4.04},
                        {name:"Lettuce", type:"Vegetables", qty:3412, valChange:0.35,}
                        ],
        view_item: "Chicken",
        next_value_dict: {Bun:4136, Chicken:2019, Beef:2900, Lettuce:3328},
        value_changes: {Bun:4012, Chicken:2134, Beef:2987, Lettuce:3412}
    });
});

Router.get('/updateSupply/:name', async function(req, res) {
    return res.render('inventory/updateSupply', {
        next_orders: 4136,
        item_name: "Bun",
        supply_type: "Others",
    });
});

Router.get('/viewSuppliesOrder', async function(req, res) {
    return res.render('inventory/submittedSupplies', {
        next_value_dict: {Bun:4136, Chicken:2019, Beef:2900, Lettuce:3328}
    });
});

module.exports = Router;
