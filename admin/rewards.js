const Express = require('express');
const flashMessage = require('../../utils/flashmsg');
const Router = Express.Router();
const RewardsList = require('../../models/RewardsList');
const UserRewards = require('../../models/UserRewards');
const Menu = require('../../models/Menu');
const Cart = require('../../models/Order');

// /**
//  * 
//  * @param {Express.Request} req Express Request handle
//  * @param {Express.Response} res Express Response handle
//  */
// function something(req, res) { req}

// Accessing edit rewards page
Router.get('/edit/:day_no', async function (req, res) {
    console.log("Admin edit rewards page accessed");
    try {
        const reward = await RewardsList.findOne({ where: { day_no: req.params.day_no } });
        // Returning the original rewards if it has already been added
        if (reward != null) {
            return res.render('rewards/manageRewards', {
                day_no: req.params.day_no,
                name1: reward.food_primary,
                name2: reward.food_secondary
            })
        }
        // Else return with empty input
        else {
            return res.render('rewards/manageRewards', {
                day_no: req.params.day_no
            });
        }
    }
    catch (error) {
        console.log("There are errors fetching data of day " + req.params.day_no);
        console.log(error);
    }
});

// Post when changes are submitted
Router.post('/edit/:day_no', async function (req, res) {
    let errors = [];
    // Change RewardsList to Menu model when Menu model is ready
    // Checks if food exists in menu
    const reward1 = await Menu.findOne({ where: { item_name: req.body.name1 } });
    if (reward1 == null) {
        errors = errors.concat({text:"Item 1: Food item not found in menu"});
    }

    if (req.body.name2 != "") {
        const reward2 = await Menu.findOne({ where: { item_name: req.body.name2 } });
        console.log(reward1);
        if (reward2 == null) {
            errors = errors.concat({text:"Item 2: Food item not found in menu"});
        }
    }

    if (errors.length > 0) {
        throw new Error(`There are ${errors.length} in updating reward item(s)`);
    }
    console.log("Item is identified. Executing create/update");
    // Create/Update executions
    let name2 = req.body.name2
    if (req.body.name2 == "") {
        name2 = null;
    }
    
    try {
        const reward = await RewardsList.findOne({ where: { day_no: req.params.day_no } });
        console.log(reward);
        if (reward == null) {
            const updateReward = await RewardsList.create({
                day_no: req.params.day_no,
                food_primary: req.body.name1,
                food_secondary: name2
            });
            console.log("Successfully created new reward object");
            flashMessage(res, 'success', 'Successfully created reward', '', true);
        }
        else {
            const updateReward = await RewardsList.update({
                food_primary: req.body.name1,
                food_secondary: name2
            }, { where:{ day_no:req.params.day_no }});
            console.log("Successfully updated reward object");
            flashMessage(res, 'success', 'Successfully created reward', '', true);
        }
        
    }
    catch (error) {
        console.error("An error occured while trying to update the prize");
        console.error(error);
        return res.status(500).end();
    }

    return res.redirect("/admin/rewards/rewardsList");
});

// Accessing admin rewards page
Router.get('/rewardsList', async function (req, res) {
    console.log("Admin rewards page accessed");
    // Get all prizes
    const prizes = await RewardsList.findAll({
        order: [['day_no', 'ASC']],
        raw: true
    })

    // Filling up not registered days with null keys
    var temp = 5;
    try {
        for (i = 0; i < 12; i++) {
            if (prizes[i]['day_no'] != temp) {
                prizes.splice(i, 0, { day_no:temp, food_primary: null, food_secondary: null });
            }
            temp += 5;
        }
    }
    catch (TypeError) {
        console.log("Database is empty");
        for (i=temp; i<61; i+=5) {
            prizes.push({ day_no:i, food_primary: null, food_secondary: null })
        }
    }

    // Arranging the array in "rows with 4 columns" format for handlebars to display
    const prizes_list = [];
    for (i = 0; i < 3; i++) {
        prizes_list.push(prizes.splice(0, 4));
    }

    return res.render('rewards/rewardsAdmin', {
        prizes_list: prizes_list
    });
});

Router.get('/add-reward-to-cart/:day_no', async function (req, res) {
    const reward = await UserRewards.findOne({
        where: {day_no:req.params.day_no},
        raw: true
    });
});

module.exports = Router;
