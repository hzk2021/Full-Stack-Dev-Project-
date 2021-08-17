const Express = require('express');
const { User } = require('../../models/User');
const Feedback = require('../../models/Feedback');
const Entry = require('../../models/Entry');
const { Op } = require('sequelize');
const Router = Express.Router();

Router.get('/', async function(req, res){
    const users_data = await getUserDBData();
    const suppliers_data = await getSupplierDBData();
    const admins_data = await getAdminDBData();
    const feedbacks_data = await getFeedbackDBData();
    const entries_data = await getEntryDBData();

    return res.render('dashboard/gDashboard', {
        'userCount': users_data['count'],
        'verifiedUserCount': users_data['verifiedCount'],
        'notVerifiedUserCount': users_data['notVerifiedCount'],
        'supplierCount': suppliers_data['count'],
        'adminCount': admins_data['count'],
        'positiveFeedback' : feedbacks_data['positive'],
        'negativeFeedback' : feedbacks_data['negative'],
        'entryCount' : entries_data['count']
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
                entries_data[normal] += 1;
            }

            entries_data['count'] += 1
            
        }
    } catch(err){
        console.error(err);
    }

    return entries_data;
}

module.exports = Router;