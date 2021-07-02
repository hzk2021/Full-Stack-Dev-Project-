const Express = require('express');
const { User, UserRole} = require('../../models/User');
const Router = Express.Router();
const AccountChecker = require('../../utilities/account_checker');
const { Op, Model } = require('sequelize');

Router.get('/list', AccountChecker.isLoggedIn, async function(req,res) {
    return res.render('accounts/showAccounts');
});

Router.get('/list-data', AccountChecker.isLoggedIn, async function(req,res) {
    console.log(req.query);
    const filterSearch = req.query.search;

    const condition = {
        [Op.or]: {
            "uuid": { [Op.substring]: filterSearch} ,
            "email": { [Op.substring]: filterSearch} ,
            "name": { [Op.substring]: filterSearch} ,
            "role": { [Op.substring]: filterSearch}
        }
    }

    const totalFound = await User.count({
        where: condition
    })

    let users_list = []
    try{
        users_list = await User.findAll({
            where: condition,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            raw: true
        });
    }catch(error){
        console.log("Error retrieving accounts in User Database");
        console.error(error);
    }

    return res.json({
        "total": totalFound,
        "rows": users_list
    });
});

module.exports = Router;
