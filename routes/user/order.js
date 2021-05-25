const Express = require('express');
const Router = Express.Router();

Router.get('/cart', async function(req, res) {
    var subtotal = 0
    let order_list = [{food:"Chargrilled Chicken Club", price:11.90}]
    for (var i in order_list) {
        subtotal += 11.90
    }
    total = subtotal + 4.00
    return res.render('orders/cart', {
        order_list: order_list,
        order_rewards_list:{food:"Coca-cola"},
        subtotal: subtotal.toFixed(2),
        delivery_price: 4.00.toFixed(2),
        total: total.toFixed(2)
    })
})

module.exports = Router;