const Express = require('express');
const Router = Express.Router();
const RewardsList = require('../../models/RewardsList');
const UserRewards = require('../../models/UserRewards');
const Order = require('../../models/Order')

Router.get('/viewRewards', async function (req, res) {
    console.log("Rewards page viewed");
    let errors = [];
    const total_orders = 0
    try {
        total_orders = Order.count({ where: { uuid: req.user.uuid } });
    }
    catch (TypeError) {
        console.log("User accessed with no account");
    }
    // var total_orders = 12;
    const full_rows = Math.floor(total_orders / 5);
    const leftover = { Reached: total_orders - full_rows * 5, Unreached: 4 - (total_orders - full_rows * 5) };
    // Retrieve full prizes list with length of 12(Null values filled in for unregistered prize days)
    const prizes_list = await RewardsList.findAll({
        order: [['day_no', 'ASC']],
        raw: true
    })
    // Fill up unregisted days
    var temp = 5;
    try {
        for (i = 0; i < 12; i++) {
            if (prizes_list[i]["day_no"] != temp) {
                prizes_list.splice(i, 0, { food_primary: null, food_secondary: null });
            }
            temp += 5;
        }
    // Fill up the rest at the back
    } catch (TypeError) {
        for (i = temp; i < 61; i += 5) {
            prizes_list.push({ day_no: i, food_primary: null, food_secondary: null })
        } 
    }
    // Retrieve prizes of the user
    const user_prizes = [];
    try {
        const user_prizes = await UserRewards.findAll({
            include: [{
                model: RewardsList,
                attributes: ['food_primary', 'food_secondary', 'claimed']
            }],
            where: { uuid: req.user.uuid },
            order: [['day_no', 'ASC']]
        });
    }
    catch (TypeError) {
        console.log("Unable to get user progress as user is not logged in");
    }
    /*const prizes_list = ["Coca-cola", "Beef Chili Cheese Fries", "Chargrilled Chicken Club", "Battered Cod Fish", 
                        "(Not specified)", "(Not specified)", "(Not specified)", "(Not specified)",
                        "(Not specified)", "(Not specified)", "(Not specified)", "(Not specified)"]*/

    const middle = prizes_list[leftover.Reached];
    const not_reached = prizes_list.slice(leftover.Reached + 1, prizes_list.length);
    return res.render('rewards/rewardsPage', {
        total_orders: total_orders,
        leftover: leftover,
        middle: middle,
        user_prizes: user_prizes,
        not_reached: not_reached,
    });
});

module.exports = Router;
