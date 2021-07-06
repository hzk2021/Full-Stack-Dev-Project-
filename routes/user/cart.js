const Express = require('express');
const Router = Express.Router();
const Cart = require('../../models/Cart');
const {UserRewards} = require('../../models/UserRewards');
const Order = require('../../models/Order');
const { Op } = require('sequelize');
const {RewardsList} = require('../../models/RewardsList');

Router.get('/', async function(req, res) {
    var subtotal = 0
    let order_list = [{food:"Chargrilled Chicken Club", price:11.90}]
    const prizes_order_list = await Cart.findAll({
        where: {
            cart_item_price: 0
        },
        raw: true
    });
    for (var i in order_list) {
        subtotal += 11.90
    }
    total = subtotal + 4.00
    return res.render('cart/cart', {
        order_list: order_list,
        prizes_order_list: prizes_order_list,
        subtotal: subtotal.toFixed(2),
        delivery_price: 4.00.toFixed(2),
        total: total.toFixed(2)
    })
})

Router.get('/confirmOrder', async function(req, res) {
    var subtotal = 0
    let order_list = [{food:"Chargrilled Chicken Club", price:11.90}]
    for (var i in order_list) {
        subtotal += 11.90
    }
    total = subtotal + 4.00
    return res.render('cart/confirmOrder', {
        order_list: order_list,
        order_rewards_list:{food:"Coca-cola"},
        subtotal: subtotal.toFixed(2),
        delivery_price: 4.00.toFixed(2),
        total: total.toFixed(2)
    })
})

Router.get('/orderComplete', async function(req, res){
    console.log("Order completed");
    console.log("===================");
	const dtime = 30;
	var etime = dtime + 10
    // Rewards Operations below
    if (req.user.uuid != null) {
        // Marking rewards claimed
        const rewards = await Cart.findAll({where:{cart_item_price: 0}});
        let rewards_days = [];
        for (var obj in rewards) {
            rewards_days.push(parseInt(obj.cart_item_name.substring(-3, -1)));
        }
            const claimedReward = UserRewards.update({
                claimed: true
            }, {where: {
                uuid: req.user.uuid,
                [Op.in]: rewards_days
            }});
        
        // Adding reward if user has hit checkpoint
        var total_orders = 0;
        try {
            total_orders = await Order.count({ 
                where: { uuid: req.user.uuid },
                col: 'order_id',
            });
        }
        catch (TypeError) {
            console.log(`An error occured trying to get count of user:${req.user.uuid} orders`);
        }
        console.log("Total orders:"+total_orders);
        if (total_orders % 5 == 0) {
            try {
                total_orders = await RewardsList.findOne({where:{day_no:total_orders}});
                const add_reward = await UserRewards.create({
                    uuid: req.user.uuid,
                    day_no: total_orders.day_no
                });
                
                console.log(`Successfully added reward to user:${req.user.uuid}'s rewards list`);
            }
            catch (error) {
                console.error("An error occured");
                console.error(error);
            }
        }
    }

	res.render('cart/orderComplete', {
		dtime : dtime,
		etime : etime
	});
});

module.exports = Router;