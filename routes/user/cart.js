const Express = require('express');
const Router = Express.Router();
const {Cart} = require('../../models/Cart');
const {UserRewards} = require('../../models/UserRewards');
const {RewardsList} = require('../../models/RewardsList');
const {Order} = require('../../models/Order');
const { Sequelize, Op } = require('sequelize');
const {Menu} = require('../../models/Menu');
const {SupplyPerformance} = require('../../models/SupplyPerformance');
const { Supplies } = require('../../models/Supplies');
const {arrange_rewards_tab} = require('../../utilities/functions');

//Retrieve cart items
Router.get('/', async function(req, res){
    console.log("Confirm order page accessed");
    try {
        const cart = await Cart.findAll({
            where: { cart_user_id: req.user.uuid},
            attributes: ['cart_item_name', 'cart_item_price', 'cart_item_quantity'],
            raw: true
        });

        // Calculate Subtotal, Delivery fee, Total
		let subtotal = 0
		for (let i in cart) {
			subtotal += cart[i].cart_item_price * cart[i].cart_item_quantity;
		};

		const deliveryFee = 5;

		const total = subtotal + deliveryFee;

        // Below is for rewards
        // Get user rewards
        let prizes_list;
        try {
            const rewards = await RewardsList.findAll({
                include: [{
                    model: UserRewards,
                    where: {
                        uuid:req.user.uuid,
                        claimed: false
                    }
                }],
                attributes: ['day_no', 'food_name'],
                where:{uuid:req.user.uuid},
                raw: true
            });

            prizes_list = await arrange_rewards_tab(rewards);
        }
        catch (error) {
            console.log(error)
            console.error("User is not logged in");
        }
		
        return res.render('cart/cart', {
            cart: cart,
            subtotal: subtotal.toFixed(2),
            deliveryFee: deliveryFee.toFixed(2),
            total: total.toFixed(2),
            prizes_list: prizes_list
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
 

module.exports = Router;