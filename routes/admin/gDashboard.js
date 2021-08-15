const Express = require('express');
const { User } = require('../../models/User');
const { Op } = require('sequelize');
const Router = Express.Router();

Router.get('/', async function(req, res){
    users_data = await getUserDBData();
    suppliers_data = await getSupplierDBData();
    admins_data = await getAdminDBData();

    return res.render('dashboard/gDashboard', {
        'userCount': users_data['count'],
        'supplierCount': suppliers_data['count'],
        'adminCount': admins_data['count'],
    })
});


async function getUserDBData(){
    users_data = {

    }

    try{
        const users = await User.findAll({
            where: {
                role: 'user'
            }
        });
        users_data['count'] = users.length
    } catch(err){

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

    }

    return admins_data;
}
module.exports = Router;