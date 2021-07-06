const Express = require('express');
const Router = Express.Router();
const {RewardsList} = require('../../models/RewardsList');
const {UserRewards} = require('../../models/UserRewards');
const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const { Op } = require('sequelize');
const e = require('connect-flash');

Router.get('', async function (req, res) {
    console.log("Rewards page viewed");
    let errors = [];
    var total_orders = 0
    try {
        total_orders = await Order.count({ 
            where: { uuid: req.user.uuid },
            col: 'order_id',
        });
    }
    catch (TypeError) {
        console.log("User accessed with no account");
    }
    const full_rows = Math.floor(total_orders / 5);
    const leftover = { Reached: total_orders - full_rows * 5, Unreached: 4 - (total_orders - full_rows * 5) };
    // Retrieve full prizes list with length of 12(Null values filled in for unregistered prize days)
    const prizes_list = await RewardsList.findAll({
        order: [['day_no', 'ASC']],
        raw: true
    });
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
    let user_prizes = [];
    try {
        user_prizes = await UserRewards.findAll({
            include: [{
                model: RewardsList,
                attributes: ['food_primary', 'food_secondary']
            }],
            attributes: ['claimed'],
            where: { uuid: req.user.uuid },
            order: [['day_no', 'ASC']],
            raw: true
        });
    }
    catch (error) {
        console.error("Unable to get user progress. Reasons: User is not logged in/User has no rewards");
        console.error(error);
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

Router.get('/add-reward-to-cart/:day_no', async function (req, res) {
    const reward = await UserRewards.findOne({
        where: {day_no:req.params.day_no},
        raw: true
    });

    // Adding primary food
    const cart = await Cart.create({
        cart_item_name: reward.food_primary+"--Reward<"+reward.day_no.ToFixed(2)+">",
        cart_item_price: 0,
        cart_item_quantity: 1
    });

    // Adding secondary food
    if (reward.food_secondary != null) {
        const cart2 = await Cart.create({
            cart_item_name: reward.food_secondary+"--Reward<"+reward.day_no.ToFixed(2)+">",
            cart_item_price: 0,
            cart_item_quantity: 1
        }); 
    }

    return res.redirect('/user/cart');
});

Router.get('/remove-reward-from-cart/:day_no', async function (req, res) {
    const removeReward = await Cart.destroy({where:{
        [Op.like]: '%--Reward<'+req.params.day_no+'>'
    }});

    return res.redirect('/user/cart');
})

module.exports = Router;
