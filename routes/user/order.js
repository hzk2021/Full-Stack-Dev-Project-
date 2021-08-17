const Express = require('express');
const Router = Express.Router();
const {Cart} = require('../../models/Cart');
const {UserRewards} = require('../../models/UserRewards');
const {Order} = require('../../models/Order');
const { Sequelize, Op } = require('sequelize');
const {Menu} = require('../../models/Menu');
const {SupplyPerformance} = require('../../models/SupplyPerformance');
const { Supplies } = require('../../models/Supplies');

const Axios = require('axios');
const FileSys = require('fs');
const Hash = require('hash.js');
const Moment = require('moment');
const { nets_api_key, nets_api_skey, nets_api_gateway } = require('./payment-config.js');
const { Payment } = require('../../models/Payment');
const uuid = require('uuid');
const { RewardsList } = require('../../models/RewardsList');

let   nets_stan     = 0;	//	Counter id for nets, keep this in database

// Retrieve order details
Router.get('/confirmOrder', async function(req, res) {
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
		
        return res.render('order/confirmOrder', {
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


// Insert payment here -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Signs the payload with the secret key
 * @param {{}} payload 
 * @returns {string} Signature
 */
 function generate_signature(payload) {
	// 1. signature = json + secret (Concatenate payload and secret)
	const content = JSON.stringify(payload) + nets_api_skey;
	// 2. signature = sha265(signature)SHA-256 Hash 
	// 3. signature = uppercase(signature)Convert to Uppercase 
	const hash    = Hash.sha256().update(content).digest('hex').toUpperCase();
	// 4. signature = base64encode(signature)Base64 encode
	return (Buffer.from(hash, 'hex').toString('base64'));
}

// Retrieve order total to generate NETS QR code
Router.get('/payment', async function(req, res) {
	try {
		console.log("Payment page accessed");
        const cart = await Cart.findAll({
            where: { cart_user_id: req.user.uuid},
            attributes: ['cart_item_price', 'cart_item_quantity'],
            raw: true
        });
		console.log('first1', cart);
        // Calculate subtotal, delivery fee, total, total in cents
		let subtotal = 0;
		for (let i in cart) {
			subtotal += cart[i].cart_item_price * cart[i].cart_item_quantity;
		};

		const deliveryFee = 5;

		const total = subtotal + deliveryFee;
		const totalCents = total * 100;

		// Generate order ID
		const orderID = uuid.v4();
	
        return res.render('payment/payment', {
            total: total.toFixed(2),
			totalCents: Math.round(totalCents),
			orderID: orderID,
        });    
    }
    catch (error) {
        console.error("An error occured while trying to retrieve the cart items");
        console.error(error);
        return res.status(500).end();
    }
});

// Generate NETS QR code
Router.post('/payment',async function(req, res) {
	try {
		if (!req.body.amount)
			throw Error("missing required parameter `amount`");
	}
	catch (error) {
		console.error(`Bad request`);
		console.error(error);
		return res.sendStatus(400);
	}

	//	Load the constant JSON request 
	try {
		const amount   = parseInt(req.body.amount);	//	Assume in cents
		const datetime = new Date();				//	Current date and time

		// Retrieve nets_stan
		const payment = await Payment.findAll({
            where: { payment_user_id: req.user.uuid},
            attributes: ['payment_stan'],
            raw: true
        });
		let nets_stan = 0;
		for (let i in payment) {
			if (payment[i].payment_stan > nets_stan) {
				nets_stan = payment[i].payment_stan;
			}
		}

		const payload  = JSON.parse(FileSys.readFileSync(`${process.cwd()}/res/nets/nets-qr-request.json`));
		const stan     = ++nets_stan;

		// Create nets stan
		const today = new Date();
		const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		const dateTime = date+' '+time;
		const totalDollars = req.body.amount / 100;
		const createPayment = await Payment.create({
			payment_user_id: req.user.uuid,
			payment_order_id: req.body.orderID,
			payment_amount: totalDollars,
			payment_stan: stan,
			payment_dateTime: dateTime,
		});

		//	Ensures that nets_stan is between 0 ~ 999999
		if (nets_stan >= 1000000)
			nets_stan = 0;

			//	Just update these stuff
		payload.stan             = stan.toString().padStart(6, '0');
		payload.amount           = amount;
		payload.npx_data.E201    = amount;
		payload.transaction_date = Moment(datetime).format("MMDD");
		payload.transaction_time = Moment(datetime).format("HHmmss");

		//	Sign the payload
		const signature = generate_signature(payload);
		const response = await Axios.post(nets_api_gateway.request, payload, {
			headers: {
				"Content-Type": "application/json",
				"KeyId":        nets_api_key,
				"Sign":         signature
			}
		});

		if (response.status != 200)
			throw new Error("Failed request to NETs");

		if (response.data.response_code != '00') {
			throw new Error("Failed to request for QR Code");
		}

		console.log('chicken',response.data.stan);

		return res.json({
			"txn_identifier":   response.data.txn_identifier,
			"amount":           response.data.amount,
			"stan":             response.data.stan,
			"transaction_date": response.data.transaction_date,
			"transaction_time": response.data.transaction_time,
			"qr_code":          response.data.qr_code
		});
	}
	catch (error) {
		console.error(`Failed to generate QR code for payment`);
		console.error(error);
		return res.sendStatus(500);
	}
});


Router.post('/query',async function(req, res) {
	try {

	}
	catch (error) {
		console.error(`Bad request`);
		console.error(error);
		return res.sendStatus(400);
	}

	try {
		const payload  = JSON.parse(FileSys.readFileSync(`${process.cwd()}/res/nets/nets-qr-query.json`));
		
		payload.txn_identifier   = req.body.txn_identifier;
		payload.stan             = req.body.stan;
		payload.transaction_date = req.body.transaction_date;
		payload.transaction_time = req.body.transaction_time;
		payload.npx_data.E201    = req.body.amount;
		
		const signature = generate_signature(payload);
		const response  = await Axios.post(nets_api_gateway.query, payload, {
			headers: {
				"Content-Type": "application/json",
				"KeyId":        nets_api_key,
				"Sign":         signature
			}
		});

		if (response.status != 200) 
			throw new Error(`Failed to query transaction: ${payload.txn_identifier}`);
		
		switch (response.data.response_code) {
			//	Pending
			case "09":
				return res.json({
					status : 0
				});

			//	Success
			case "00":
				return res.json({
					status : 1
				});

			//	Failed
			default:
				return res.json({
					status : -1
				});
		}
	}
	catch (error) {
		console.error(`Failed to query transaction`);
		console.error(error);
		return res.sendStatus(500);
	}
});

// Void nets 
Router.post('/void',async function(req, res) {
	try {

	}
	catch (error) {
		console.error(`Bad request`);
		console.error(error);
		return res.sendStatus(400);
	}

	try {
		const payload  = JSON.parse(FileSys.readFileSync(`${process.cwd()}/res/nets/nets-qr-void.json`));
		
		payload.txn_identifier   = req.body.txn_identifier;
		payload.stan             = req.body.stan;
		payload.transaction_date = req.body.transaction_date;
		payload.transaction_time = req.body.transaction_time;
		payload.amount           = req.body.amount;
		
		const signature = generate_signature(payload);
		const response  = await Axios.post(nets_api_gateway.void, payload, {
			headers: {
				"Content-Type": "application/json",
				"KeyId":        nets_api_key,
				"Sign":         signature
			}
		});

		if (response.status != 200) 
			throw new Error(`Failed to query transaction: ${payload.txn_identifier}`);
		
		console.log(response.data);

		switch (response.data.response_code) {
			//	Success
			case "00":
				return res.json({
					status : 1
				});
			case "68":
				return res.json({
					status : 0
				});
			//	Skip?
			default:
				return res.json({
					status : -1
				});
		}
	}
	catch (error) {
		console.error(`Failed to void transaction`);
		console.error(error);
		return res.sendStatus(500);
	}	
});
// ___________________________________________________________________________________________________________________________________________________________________________________________

// Order success page
Router.get('/orderComplete/:orderID', async function(req, res){
    console.log("Order create page");
	
	// Delete all payment requests leaving final transaciton
	try {
        const payment = await Payment.findAll({
            where: { payment_user_id: req.user.uuid, payment_order_id: req.params.orderID },
            attributes: ['payment_stan'],
            raw: true
        });
		let nets_stan = 0;
		for (let i in payment) {
			if (payment[i].payment_stan > nets_stan) {
				nets_stan = payment[i].payment_stan;
			}
		}
		const deletePayment = await Payment.destroy({
			where:{ 
				payment_user_id: req.user.uuid,
				payment_order_id: req.params.orderID,
				payment_stan: {
					[Sequelize.Op.not]: nets_stan
				}
			}
		});
	   
	   console.log("Successfully cleared payment requests");
    }
    catch (error) {
        console.log("Error fetching " + req.params.item_name + " from menu");
        console.log(error);
    }
	
	// Create orders
	try {
		// Check if order exisits to prevent double create
		const order = await Order.findAll({
            where: { order_user_id: req.user.uuid, order_id: req.params.orderID }
        });
		// Retrieve cart items
		const cart = await Cart.findAll({
            where: { cart_user_id: req.user.uuid },
            attributes: ['cart_item_name', 'cart_item_price', 'cart_item_quantity'],
            raw: true
        });
		// Get date time
		const today = new Date();
		const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		const dateTime = date+' '+time;

		if (order.length == 0) {
			for (let i in cart){	
				const createOrder = await Order.create({
					order_id: req.params.orderID,
					order_item_name: cart[i].cart_item_name,
					order_item_price: cart[i].cart_item_price,
					order_item_quantity: cart[i].cart_item_quantity,
					order_dateTime: dateTime,
					order_user_id: req.user.uuid,
				});
			}
			console.log("Successfully created new order object");
		}
    }
    catch (error) {
        console.error("An error occured while trying to create the order object");
        console.error(error);
        return res.status(500).end();
    }
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
		if (item.cart_item_name.includes("(Reward")) {
			item.cart_item_name = item.cart_item_name.replace(item.cart_item_name.substr(-12, 12), '');
		}
		console.log(item.cart_item_name);
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
    const total_orders = await Order.aggregate('order_id', 'count', { 
        distinct: true,
        where: { order_user_id: req.user.uuid }
    });
    console.log("Total orders:"+total_orders);

    // Add if orders reached multiple of 5
    if (total_orders % 5 == 0 && total_orders != 0) {
        try {
			const reward_exists = await RewardsList.findOne({
				where: {day_no: total_orders}
			});
			// If user reached a reward that has not been set, create a new reward item
			// Ensure promise to user that the reward will be given once set
			if (reward_exists == null) {
				const make_null_day = await RewardsList.create({
					day_no: total_orders,
					food_no: 1
				});
			}
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
	const dtime = 10;
	const etime = 20;
	res.render('order/orderComplete', {
		dtime : dtime,
		etime : etime
	});
});


module.exports = Router;