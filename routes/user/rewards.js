const Express = require('express');
const Router = Express.Router();
const {RewardsList} = require('../../models/RewardsList');
const {UserRewards} = require('../../models/UserRewards');
const {Order} = require('../../models/Order');
const {Cart} = require('../../models/Cart');
const { Op } = require('sequelize');
const { arrange_rewards, arrange_rewards_noNull, arrange_rewards_tab } = require('../../utilities/functions');


Router.get('', async function (req, res) {
    console.log("Rewards page viewed");
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

Router.post('/add-reward-to-cart', async function (req, res) {
    // Get all food from the day
    const reward = await RewardsList.findAll({
        attributes: ['day_no', 'food_name'],
        where: {day_no:req.body.day_no},
        raw: true
    });
    console.log(reward);
    const cart_id = await Cart.findOne({
        attributes: ['cart_item_id'],
        where: {cart_user_id: req.user.uuid}
    })

    // Adding all reward food into cart
    added_array = [];
    var day_no = req.body.day_no.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    });
    
    for (var obj in reward) {
        // Adding the item into the cart
        if (added_array.includes(reward[obj].food_name)) {
            cart = await Cart.increment('cart_item_quantity', {
                where: {
                    cart_item_name: reward[obj].food_name+" (Reward "+day_no+")",
                    cart_user_id: req.user.uuid 
                }
            });
        }
        // Else add on to the quantity of the item
        else {
            cart = await Cart.create({
                cart_user_id: req.user.uuid,
                cart_item_id: cart_id.cart_item_id,
                cart_item_name: reward[obj].food_name+" (Reward "+day_no+")",
                cart_item_price: 0,
                cart_item_quantity: 1
            });
            added_array.push(reward[obj].food_name);
        }
    }
    // Mark the rewards claimed
    const claimed = await UserRewards.update({
        claimed: true
    }, {where: {
        day_no: req.body.day_no,
        uuid: req.user.uuid
    }});

    // Get all the newly added items
    const added_items = await Cart.findAll({
        attributes: ['cart_item_name', 'cart_item_price', 'cart_item_quantity'],
        where: { 
            cart_user_id: req.user.uuid,
            cart_item_name: { [Op.substring]: "(Reward "+day_no+")" }
        },
        raw: true
    });

    return res.json({
        added_items: added_items
    });
});

Router.post('/remove-reward-from-cart', async function (req, res) {
    // Remove from cart
    var day_no = req.body.day_no.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    });
    try {
        const removeReward = await Cart.destroy({where:{
            cart_item_name: {[Op.substring]: '(Reward '+day_no+')'}
        }});
        // Mark the rewards unclaimed
        const unclaim = await UserRewards.update({
            claimed: false
        }, {where: {day_no: req.body.day_no}});
    }
    catch (error) {
        console.error("An error occurred trying to remove reward from cart");
        console.error(error);
    }
    // Get user rewards (For rewards tab)
    const rewards = await RewardsList.findAll({
        include: [{
            model: UserRewards,
            where: {
                uuid:req.user.uuid,
                day_no: req.body.day_no
            },
            order: [['day_no', 'ASC']]
        }],
        attributes: ['day_no', 'food_name'],
        raw: true
    });
    const prizes_list = await arrange_rewards_tab(rewards);

    return res.json({
        prizes_list: prizes_list
    });
})

module.exports = Router;
