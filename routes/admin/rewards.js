const Express = require('express');
const Router = Express.Router();
const Rewards = require('../../models/RewardsList');
const User = require('../../models/User');

/**
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
Router.get('/editRewards/:day_no', async function(req,res) {
    /*try {
        const reward = await Rewards.findOne({where: {name:req.params.day_no}});
        if (reward != null) {
            return res.render('rewards/manageRewards', {
                day_no: req.params.day_no,
                name1: reward.food_primary,
                name2: reward.food_secondary
            })
        }
        else {
            return res.render('rewards/manageRewards', {
                day_no: req.params.day_no
            })
        }
    }
    catch (error) {
        console.log("There are errors fetching data of day "+req.params.day_no);
        console.log(error);
    }*/
    res.render('rewards/manageRewards', {
        day_no: req.params.day_no,
        reward1: "Coca-cola",
        reward2: null
    })
});

Router.get('/adminRewardsList', async function(req,res) {
    console.log("Admin rewards page accessed");
    return res.render('rewards/rewardsAdmin', {
        prizes_list: [["Coca-cola", "Beef Chili Cheese Fries", "Chargrilled Chicken Club", "Battered Cod Fish"], 
                        [null, null, null, null],
                        [null, null, null, null]]
    });
});

Router.post('/editRewards', async function(req, res) {
    let errors = [];

    // Change Rewards to Menu model when Menu model is ready
    try {
        const food_primary = await Rewards.findOne({where: {name1:req.body.name1}});
        if (food_primary == null) {
            errors.push({text: "1st Item: Food item not found in menu"})
        }
        const food_secondary = await Rewards.findOne({where: {name2:req.body.name2}});
        if (food_secondary == null) {
            errors.push({text: "2nd Item: Food item not found in menu"})
        }
    }
    catch(error) {
        console.error("Error updating reward item(s)")
        return res.render('rewards/manageRewards')
    }

    try {
        const reward = await Rewards.update({
            food_primary: req.body.name1,
            food_secondary: req.body.name2
        })
    }
    catch(error) {

    }
})

module.exports = Router;
