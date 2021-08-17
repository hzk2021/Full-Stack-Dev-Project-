const Express = require('express');
const { User } = require('../../models/User');
const Feedback = require('../../models/Feedback');
const Entry = require('../../models/Entry');
const { Order } = require('../../models/Order');
const { Op, fn, col} = require('sequelize');
const { sequelize } = require('../../configs/database');
const { getKeyByValue } = require('../../utilities/helperFunctions');
const Router = Express.Router();

Router.get('/', async function(req, res){
    const users_data = await getUserDBData();
    const suppliers_data = await getSupplierDBData();
    const admins_data = await getAdminDBData();
    const feedbacks_data = await getFeedbackDBData();
    const entries_data = await getEntryDBData();
    const orders_data = await getOrderDBData();

    return res.render('dashboard/gDashboard', {
        'userCount': users_data['count'],
        'verifiedUserCount': users_data['verifiedCount'],
        'notVerifiedUserCount': users_data['notVerifiedCount'],
        'supplierCount': suppliers_data['count'],
        'adminCount': admins_data['count'],
        'positiveFeedback' : feedbacks_data['positive'],
        'negativeFeedback' : feedbacks_data['negative'],
        'entryCount' : entries_data['count'],
        'totalOrder': orders_data['totalOrder'],
        'totalAmount': orders_data['totalAmount']
    })
});

Router.get('/chart', async function(req,res){
    const users_data = await getUserDBData();
    const suppliers_data = await getSupplierDBData();
    const admins_data = await getAdminDBData();
    const feedbacks_data = await getFeedbackDBData();
    const entries_data = await getEntryDBData();
    const orders_data = await getOrderDBData();

    return res.render('dashboard/showChart', {
        'userCount': users_data['count'],
        'verifiedUserCount': users_data['verifiedCount'],
        'notVerifiedUserCount': users_data['notVerifiedCount'],
        'supplierCount': suppliers_data['count'],
        'adminCount': admins_data['count'],
        'positiveFeedback' : feedbacks_data['positive'],
        'negativeFeedback' : feedbacks_data['negative'],
        'entryCount' : entries_data['count'],
        'normalTemp' : entries_data['normal'],
        'abnormalTemp' : entries_data['abnormal'],
        'orderDates': orders_data['orderDates'],
        'revenuePerDate': orders_data['revenuePerDate']
    })
});

async function getUserDBData(){
    users_data = {
        verifiedCount: 0,
        notVerifiedCount: 0
    }

    try{
        const users = await User.findAll({
            where: {
                role: 'user'
            }
        });
        users_data['count'] = users.length
        users.forEach(u => {
            if (u.eActive == 1){
                users_data['verifiedCount'] += 1
            }else{
                users_data['notVerifiedCount'] += 1
            }
        });

    } catch(err){
        console.error(err);
    }

    return users_data;
}

async function getSupplierDBData(){
    suppliers_data = {

    }

    try{
        const suppliers = await User.findAll({
            where: {
                role: 'supplier'
            }
        });
        suppliers_data['count'] = suppliers.length
    } catch(err){
        console.error(err);
    }

    return suppliers_data;
}

async function getAdminDBData(){
    admins_data = {

    }

    try{
        const admins = await User.findAll({
            where: {
                role: 'admin'
            }
        });
        admins_data['count'] = admins.length
    } catch(err){
        console.error(err);
    }

    return admins_data;
}

async function getFeedbackDBData(){
    feedbacks_data = {
        'positive' : 0,
        'negative' : 0
    }

    try{
        const feedbacks = await Feedback.findAll({
            where: {
                type: {
                    [Op.or] : ['compliment', 'complaint']
                }
            }
        });

        for (let i = 0; i < feedbacks.length; i++) {
            switch (feedbacks[i].type) {
                case 'compliment':
                    feedbacks_data['positive'] += 1
                    break;
                default:
                    feedbacks_data['negative'] += 1
                    break;
            }
            
        }
    } catch(err){
        console.error(err);
    }

    return feedbacks_data;
}

async function getEntryDBData(){
    entries_data = {
        'count' : 0,
        'normal' : 0,
        'abnormal' : 0
    }

    try{
        const entries = await Entry.findAll();

        for (let i = 0; i < entries.length; i++) {
            if (entries[i].Temperature > 37.5 || entries[i].Temperature < 35) {
                entries_data['abnormal'] += 1;
            }
            else{
                entries_data['normal'] += 1;
            }

            entries_data['count'] += 1
            
        }
    } catch(err){
        console.error(err);
    }

    return entries_data;
}


async function getOrderDBData(){
    orders_data = {
        'totalOrder' : 0,
        'totalAmount': 0,
    }

    let order_ids = []
    let unique_order_ids = []
    let order_amounts = {}

    let order_dates = {}
    let order_dateOnly = []
    let order_revenueOnly = []

    try{
        const orders = await Order.findAll({
            order: sequelize.literal('order_dateTime ASC')
        });
        for (let i = 0; i < orders.length; i++) {
            if (order_amounts[orders[i].order_id] == undefined){
                order_amounts[orders[i].order_id] = 0;
            }

            if (order_dates[orders[i].order_dateTime] == undefined){
                order_dates[orders[i].order_dateTime] = 0;
            }

            order_amounts[orders[i].order_id] = order_amounts[orders[i].order_id] + orders[i].order_item_price * orders[i].order_item_quantity;
            order_ids.push(orders[i].order_id);

            order_dates[orders[i].order_dateTime] += orders[i].order_item_price * orders[i].order_item_quantity;

        }
        
        unique_order_ids = order_ids.filter((item, i, ar) => ar.indexOf(item) === i);

        for (let i = 0; i < unique_order_ids.length; i++) {
            order_amounts[unique_order_ids[i]] += 0; // without Delivery Fee for each order  
            //order_amounts[unique_order_ids[i]] += 5; // Delivery Fee for each order  
            orders_data['totalAmount'] += order_amounts[unique_order_ids[i]];
        }
        
        var tempDate = []
        for (var key in order_dates){
            tempDate.push(key);
        }

        var tempDateRevenue = []
        for (var key in order_dates){
            tempDateRevenue.push(order_dates[key]);
        }

        order_dateOnly = tempDate.filter((item, i, ar) => ar.indexOf(item) === i);
        order_revenueOnly = tempDateRevenue;

        orders_data['totalOrder'] = unique_order_ids.length;
        orders_data['orderDates'] = order_dateOnly;
        orders_data['revenuePerDate'] = order_revenueOnly;


    } catch(err){
        console.error(err);
    }

    return orders_data;
}

module.exports = Router;