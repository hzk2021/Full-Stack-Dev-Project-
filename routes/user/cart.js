const Express = require('express');
const Router = Express.Router();
const {Cart} = require('../../models/Cart');
const {UserRewards} = require('../../models/UserRewards');
const {Order} = require('../../models/Order');
const { Sequelize, Op } = require('sequelize');
const {Menu} = require('../../models/Menu');
const {SupplyPerformance} = require('../../models/SupplyPerformance');
const { Supplies } = require('../../models/Supplies');

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

    // Inventory operations below
    const orders = await Cart.findAll({
        attributes: ['cart_user_id', 'cart_item_name', 'cart_item_quantity'],
        where: { cart_user_id: req.user.uuid },
        raw: true
    });
    let add_quantity = {};
    // To get total amount to add into the inventory stock level record
    for (var food in orders) {
        var item = orders[food];
        // Get the food ingredient list
        let ingredients = await Menu.findOne({
            attributes: ['item_ingredients'],
            where: { item_name: item.cart_item_name }
        });
        var ingredients_list = ingredients.item_ingredients.split(',');
        // Accumulate the amount for each ingredient
        for (var supply in ingredients_list) {
            var key = await Supplies.findOne({
                attributes: ['item_id'],
                where: {
                    item_name: ingredients_list[supply]
                }
            });
            if (supply in add_quantity) {
                add_quantity[key.item_id] += parseInt(orders[food].cart_item_quantity);
            }
            else {
                add_quantity[key.item_id] = parseInt(orders[food].cart_item_quantity);
            }
        }
    }
    console.log(add_quantity);
    // Update stock used and stock left for each supply item
    for (var supply in add_quantity) {
        const addSupplies = await SupplyPerformance.increment('stock_used', {
            by: add_quantity[supply],
            where: { item_id:supply, week_no: 1 }
        });
        const reduceSupplies = await SupplyPerformance.decrement('current_stock_lvl', {
            by: add_quantity[supply],
            where: { item_id:supply, week_no: 1 }
        });
    }

    // Rewards operations below
    // Marking rewards to be claimed
    // Get rewards (identified by price = $0 )
    const rewards = await Cart.findAll({
        attributes: ['cart_item_name'],
        where: {
            uuid: req.user.uuid, 
            cart_item_price: 0
        }
    });
    // Store the days that were claimed
    let day_nos = [];
    for (var r in rewards) {
        var re_day_no = parseInt(rewards[r].cart_item_name.substring(-3, 2));
        if (!day_nos.includes(re_day_no)) {
            day_nos.push(re_day_no);
        }
    }
    // Mark the rewards claimed
    const claimedReward = await UserRewards.update({
        claimed: true
    }, { where: {
        uuid: req.user.uuid,
        day_no :{[Op.in]: day_nos}
    }});
    
    // Adding reward if user has hit checkpoint
    // Count number of orders by the user according to the order id 
    const total_orders = await Order.count({ 
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('order_id')), 'order_id']],
        where: { uuid: req.user.uuid }
    });
    console.log("Total orders:"+total_orders);

    // Add if orders reached multiple of 5
    if (total_orders % 5 == 0 && total_orders != 0) {
        try {
            const add_reward = await UserRewards.create({
                uuid: req.user.uuid,
                day_no: total_orders
            });
            console.log(`Successfully added reward to user:${req.user.uuid}'s rewards list`);
        }
        catch (error) {
            console.error("An error occured");
            console.error(error);
        }
    }

	res.render('cart/orderComplete', {
		dtime : dtime,
		etime : etime
	});
});

module.exports = Router;