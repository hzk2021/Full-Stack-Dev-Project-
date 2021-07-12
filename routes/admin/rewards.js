const Express = require('express');
const Router = Express.Router();
const {RewardsList} = require('../../models/RewardsList');
const {UserRewards} = require('../../models/UserRewards');
const Menu = require('../../models/Menu');
const Cart = require('../../models/Order');

const {isLoggedIn, isNotLoggedIn, isAdmin} = require('../../utilities/account_checker');
const rewardsArranger = require('../../utilities/rewards_arranger');

// /**
//  * 
//  * @param {Express.Request} req Express Request handle
//  * @param {Express.Response} res Express Response handle
//  */
/**
 * @param {rewardsArranger.rewards_arrange}
 */

// Accessing edit rewards page
Router.get('/edit/:day_no', isLoggedIn, isAdmin, async function (req, res) {
    console.log("Admin edit rewards page accessed");
    try {
        const rewards = await RewardsList.findAll({ 
            where: { day_no: req.params.day_no },
            order: [['day_no', 'ASC'], ['food_no', 'ASC']],
            raw: true
        });
        
        // Return no auto-filled values
        if (rewards.length == 0) {
            console.log(`Day ${req.params.day_no} is not registered in database`);
            return res.render('rewards/manageRewards', {
                day_no: req.params.day_no
            });
        }
        else {
            for (var i in rewards) {
                i.number = i.day_no / 5;
            }
            // Reward 2 and 3 values
            let rewards_mid = rewards.slice(1,3);
            var min_put = rewards_mid.length+2
            for (i=min_put; i<4; i++) {
                rewards_mid.push({day_no:rewards[0].day_no, food_name:null, food_no:i});
            }
            let last_reward = rewards[3];
            if (last_reward == null) {
                last_reward = {day_no:rewards[0].day_no, food_name:null, food_no:i}
            }
            // Returning the original rewards if it has already been added
            return res.render('rewards/manageRewards', {
                reward_1st: rewards[0],
                rewards_mid: rewards_mid,
                reward_last: rewards[3]
            });
        }
        
    }
    catch (error) {
        console.log("There are errors fetching data of day " + req.params.day_no);
        console.log(error);
    }
});

// Post when changes are submitted
Router.post('/edit/:day_no', isLoggedIn, isAdmin, async function (req, res) {
    console.log("Executing edit rewards POST");
    let errors = [];
    // Change RewardsList to Menu model when Menu model is ready
    try {
        var inp_count = 1;
        for (var inp in req.body) {
            if (req.body[inp] != "") {
                // Checks if food exists in menu
                const reward = await Menu.findOne({ where: { item_name: req.body[inp] } });
                if (reward == null) {
                    errors = errors.concat({text:`Item ${inp_count}: Food item not found in menu`});
                }
            }
            // Delete inputs left empty if any
            else {
                const delReward = await RewardsList.destroy({ where: {
                    day_no: req.params.day_no, 
                    food_no: inp_count
                } });
            }
            inp_count++;
        }

        if (errors.length > 0) {
            throw new Error(`There are ${errors.length} in updating reward item(s)`);
        }
    }
    catch (error) {
        console.error('Failed to create/update reward');
        console.error(error);
        return res.render('rewards/manageRewards', { 
            day_no: req.params.day_no,
            errors: errors,
         });
    }
    console.log("Items are identified. Executing create/update");
    // Create/Update executions
    
    try {
        var count = 1;
        for (var inp in req.body) {
            // Inserting inputs that are not empty into database
            if (req.body[inp] != "") {
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
        }
    }
    catch (error) {
        console.error("An error occured while trying to create/update the prize");
        console.error(error);
        return res.status(500).end();
    }

    return res.redirect("/admin/rewards/rewardsList");
});

Router.get('/delete-all/:day_no', async function(req, res) {
    const delAll = await RewardsList.destroy({
        where:{day_no:req.params.day_no}
    });
    console.log(`All instances of day ${req.params.day_no} is deleted`);
    return res.redirect('/admin/rewards/rewardsList/');
});

// Accessing admin rewards page
Router.get('/rewardsList', isLoggedIn, isAdmin, async function (req, res) {
    console.log("Admin rewards page accessed");
    // Get all prizes
    const prizes = await RewardsList.findAll({
        attributes: ['day_no', 'food_name'],
        order: [['day_no', 'ASC'], ['food_no', 'ASC']],
        raw: true
    });
    
    // Filling up not registered days with null keys
    const merged_prizes = rewardsArranger.arrange_rewards(prizes);
    console.log(prizes);

    // Arranging the array in "rows with 4 columns" format for handlebars to display
    const prizes_list = [];
    for (i = 0; i < 3; i++) {
        prizes_list.push(merged_prizes.splice(0, 4));
    }
    return res.render('rewards/rewardsAdmin', {
        prizes_list: prizes_list
    });
});

module.exports = Router;
