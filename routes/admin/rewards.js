const Express = require('express');
const Router = Express.Router();
const { Op } = require('sequelize');
const {RewardsList} = require('../../models/RewardsList');
const {UserRewards} = require('../../models/UserRewards');
const {Menu} = require('../../models/Menu');
const {Cart} = require('../../models/Order');
const { arrange_rewards, arrange_menu_categories } = require('../../utilities/functions');

// Accessing edit rewards page
Router.get('/edit/:day_no', async function (req, res) {
    console.log("Admin edit rewards page accessed");
    try {
        let rewards = await RewardsList.findAll({ 
            attributes: ['food_name', 'food_no'],
            where: { 
                day_no: req.params.day_no,
                food_name: {[Op.ne]: null}
            },
            order: [['food_no', 'ASC']],
            raw: true
        });
        // Get list of all menu items sorted by category name
        const menu = await arrange_menu_categories();
        
        // Return no auto-filled values
        if (rewards.length == 0) {
            console.log(`Day ${req.params.day_no} is not registered in database`);
            return res.render('rewards/manageRewards', {
                day_no: req.params.day_no,
                menu: menu
            });
        }
        else {
            // Returning the original rewards if it has already been added
            return res.render('rewards/manageRewards', {
                day_no: req.params.day_no,
                rewards: rewards,
                menu: menu
            });
        }
        
    }
    catch (error) {
        console.log("There are errors fetching data of day " + req.params.day_no);
        console.log(error);
        return res.status(500).end();
    }
});

// Post when changes are submitted
Router.post('/edit/:day_no', async function (req, res) {
    console.log("Executing edit rewards POST");
    try {
        var count = 1;
        // Create/Update executions
        console.log(req.body);
        for (var inp in req.body) {
            // Inserting inputs that are not empty into database
            const reward = await RewardsList.findOne({ 
                where: { 
                    day_no: req.params.day_no,
                    food_no: count
                } 
            });
            if (reward != null) {
                const updateReward = await RewardsList.update({
                    food_name: req.body[inp],
                }, { where:{ 
                    day_no:req.params.day_no,
                    food_no: count 
                }});
                console.log(`Successfully updated reward ${count}: ${req.body[inp]}`);
            }
            else {
                const createReward = await RewardsList.create({
                    day_no: req.params.day_no,
                    food_name: req.body[inp],
                    food_no: count
                });
                console.log(`Successfully created reward ${count}: ${req.body[inp]}`);
            }
            count++;
        }
        // Delete operation
        for (i=count; i<=4; i++) {
            const delReward = await RewardsList.update({
                food_name: null
            }, {where: {
                day_no: req.params.day_no,
                food_no: i
            }});
            console.log(`Successfully deleted reward`);
        }
    }
    catch (error) {
        console.error("An error occured while trying to create/update the prize");
        console.error(error);
        return res.status(500).end();
    }

    req.flash('success_msg', `Successfully updated Day ${req.params.day_no}!`);
    return res.redirect("/admin/rewards/list");
});

Router.get('/delete-all/:day_no', async function(req, res) {
    const delAll = await RewardsList.update({
        food_name: null
    },{where:{day_no:req.params.day_no}});
    console.log(`All instances of day ${req.params.day_no} is deleted`);
    req.flash('success_msg', `Successfully cleared Day ${req.params.day_no}!`);
    return res.redirect('/admin/rewards/list/');
});

// Accessing admin rewards page
Router.get('/list', async function (req, res) {
    console.log("Admin rewards page accessed");
    // Get all prizes
    const prizes = await RewardsList.findAll({
        attributes: ['day_no', 'food_name'],
        order: [['day_no', 'ASC'], ['food_no', 'ASC']],
        raw: true
    });
    
    // Filling up not registered days with null keys
    const merged_prizes = await arrange_rewards(prizes);
    console.log(prizes);

    // Arranging the array in "rows with 4 columns" format for handlebars to display
    const prizes_list = [];
    for (i = 0; i < 3; i++) {
        prizes_list.push(merged_prizes.splice(0, 4));
    }
    return res.render('rewards/rewardsAdmin', {
        prizes_list: prizes_list,
        success_msg: req.flash('success_msg')
    });
});

module.exports = Router;
