const Express = require('express');
const Router = Express.Router();
const {RewardsList} = require('../../models/RewardsList');
const {UserRewards} = require('../../models/UserRewards');
const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const { Op } = require('sequelize');
const { arrange_rewards } = require('../../utilities/data_arranger');


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
    // Retrieve full prizes list with length of 12 (Null values filled in for unregistered prize days)
    const prizes = await RewardsList.findAll({
        attributes: ['day_no', 'food_name'],
        order: [['day_no', 'ASC'], ['food_no', 'ASC']],
        raw: true
    });

    const prizes_list = arrange_rewards(prizes);

    // Retrieve prizes of the user
    let user_prizes_list = [];
    try {
        user_prizes_list = await UserRewards.findAll({
            include: [{
                model: RewardsList,
                attributes: ['day_no', 'food_name'],
                order: [['day_no', 'ASC'], ['food_no', 'ASC']]
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

    const user_prizes = await arrange_rewards_noNull(user_prizes_list);

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
    const reward = await UserRewards.findAll({
        attributes: ['food_name'],
        where: {day_no:req.params.day_no},
        raw: true
    });

    // Adding primary food
    let found_quant;
    let cart;
    for (var obj in reward) {
        found_quant = await Cart.findOne({
            attributes: ['cart_item_quantity'],
            where: {cart_item_name: obj.food_name}
        });
        if (found_quant == null) {
            cart = await Cart.create({
                cart_item_name: obj.food_name+" (Reward "+reward.day_no.ToFixed(2)+")",
                cart_item_price: 0,
                cart_item_quantity: 1
            });
        }
        else {
            found_quant++;
            cart = await Cart.update({
                cart_item_quantity: found_quant,
            }, { where: {cart_item_name: obj.food_name+" (Reward "+reward.day_no.ToFixed(2)+")"}});
        }
    }

    return res.redirect('/user/cart');
});

Router.get('/remove-reward-from-cart/:day_no', async function (req, res) {
    const removeReward = await Cart.destroy({where:{
        [Op.like]: '% (Reward '+req.params.day_no.ToFixed(2)+')'
    }});

    return res.redirect('/user/cart');
})

module.exports = Router;
