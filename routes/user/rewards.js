const Express = require('express');
const Router = Express.Router();
const RewardsList = require('../../models/RewardsList');
const UserRewards = require('../../models/UserRewards');

Router.get('/viewRewards', async function(req,res) {
    console.log("Rewards page viewed");
    var total_orders = 12;
    var full_rows = Math.floor(total_orders/5);
    var leftover = {Reached:total_orders-full_rows*5, Unreached:4-(total_orders-full_rows*5)};
    var prizes_list = ["Coca-cola", "Beef Chili Cheese Fries", "Chargrilled Chicken Club", "Battered Cod Fish", 
                        "(Not specified)", "(Not specified)", "(Not specified)", "(Not specified)",
                        "(Not specified)", "(Not specified)", "(Not specified)", "(Not specified)"]
    var middle = prizes_list[leftover.Reached];
    var not_reached = [];
    for (i=leftover.Reached+1; i<12; i++) {
        not_reached.push(prizes_list[i]);
    }
    return res.render('rewards/rewardsPage', {
        total_orders: 12,
        leftover: leftover,
        middle: middle,
        user_prizes: {"Coca-cola":true, "Beef Chili Cheese Fries":false},
        not_reached: not_reached,
        covered_rows: full_rows+1
    });
});

module.exports = Router;
