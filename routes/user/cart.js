const Express = require('express');
const Router = Express.Router();
const Cart = require('../../models/Cart');
const {UserRewards} = require('../../models/UserRewards');
const Order = require('../../models/Order');
const { Op } = require('sequelize');
const {RewardsList} = require('../../models/RewardsList');
const Menu = require('../../models/Menu');

//Retrieve cart items
Router.get('/', async function(req, res){
    console.log("Cart page accessed");
    console.log("niubi", req.user.uuid)
    try {
        const cart = await Cart.findAll({
            where: { cart_user_id: req.user.uuid},
            attributes: ['cart_item_name', 'cart_item_price', 'cart_item_quantity'],
            raw: true
        });
        // Calculate Subtotal, Delivery fee, Total
        let subtotal = await Cart.sum('cart_item_price', { where: { cart_user_id: req.user.uuid } });
        const deliveryFee = 5
        const total = subtotal + deliveryFee
        console.log(cart);
        return res.render('cart/cart', {
            cart: cart,
            subtotal: subtotal.toFixed(2),
            deliveryFee: deliveryFee.toFixed(2),
            total: total.toFixed(2),
        });    
    }
    catch (error) {
        console.error("An error occured while trying to retrieve the cart items");
        console.error(error);
        return res.status(500).end();
    }
});

// Add item to cart (checks whether cart alrdy has item and adds to qty if it does)
Router.get('/addToCart/:item_name', async function(req, res){
    console.log("Add to cart page accessed");
	try {
        const menu = await Menu.findOne({ where: { item_name: req.params.item_name} });
        // Calculate Qty
        let isNull = await Cart.findOne({ where: { cart_user_id: req.user.uuid, cart_item_id: menu.uuid} });
        let qty;
        if (isNull == null) {
            isNull = true;
            qty = 1;
        }else {
            qty = isNull.cart_item_quantity;
        }
        return res.render('cart/createCart', {
            cart_user_id: req.user.uuid,
            cart_item_id: menu.uuid,
            cart_item_name: req.params.item_name,
            cart_item_price: menu.item_price,
            cart_item_quantity: qty,
            isNull: isNull,
        });
    }
    catch (error) {
        console.log("Error adding " + req.params.item_name + " to cart");
        console.log(error);
    }
});

Router.post('/addToCart/:item_name', async function (req, res) {    
    try {
        if (req.body.isNull == "true") {
            const newItem = await Cart.create({
                cart_user_id: req.body.cart_user_id,
                cart_item_id: req.body.cart_item_id,
                cart_item_name: req.body.cart_item_name,
                cart_item_price: req.body.cart_item_price,
            });
            console.log("Successfully added item to cart"); 
        }
        else{
            let quantity = parseInt(req.body.cart_item_quantity) + 1;
            const repeatItem = await Cart.update({
                cart_item_quantity: quantity
            }, { where:{ cart_user_id: req.body.cart_user_id, cart_item_id: req.body.cart_item_id}});
            
            console.log("Successfully added item to cart again");
        }
    }
    catch (error) {
        console.error("An error occured while trying to add item to cart");
        console.error(error);
        return res.status(500).end();
    }


    return res.redirect("/user/menu");
});

// Delete item from cart
Router.get('/delete/:cart_item_name', async function(req, res){
    console.log("Delete item from cart page accessed");
	try {
        const cart = await Cart.findOne({ where: { cart_user_id: req.user.uuid, cart_item_name: req.params.cart_item_name } });
        return res.render('cart/deleteCart', {
            cart_item_name: req.params.cart_item_name,
            uuid: cart.uuid
        })
    }
    catch (error) {
        console.log("Error fetching " + req.params.cart_item_name + " from cart");
        console.log(error);
    }
});

Router.post('/delete/:cart_item_name', async function (req, res) {    
    try {
        const deleteCart = await Cart.destroy({
             where:{ uuid: req.body.uuid}
            });
        
        console.log("Successfully deleted cart item");
    }
    catch (error) {
        console.error("An error occured while trying to delete the menu item");
        console.error(error);
        return res.status(500).end();
    }


    return res.redirect("/user/cart");
});
// ----------------------------------------

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
                day_no :{[Op.in]: rewards_days}
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
                const rewards = await RewardsList.findAll({where:{day_no:total_orders}});
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