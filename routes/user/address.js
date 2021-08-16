const Express = require('express');
const Address = require('../../models/Address');
const Router = Express.Router();
const { Op, Model, json } = require('sequelize');
const AccountChecker = require('../../utilities/account_checker');
const HelperFunctions = require('../../utilities/helperFunctions');

Router.get('/view', AccountChecker.isLoggedIn, AccountChecker.isUser, async function(req,res) {
    try {
        const address = await Address.findAll({
            where: {
                userUUID: req.user.uuid
            },
            raw: true
        });

        return res.render('address/viewAddressBook', {
            success_msg: req.flash('success_msg'),
            error: req.flash('error'),
            errors: req.flash('errors'),
            'title': "Address Book",
            'addresses': address,
            'addressescount': address.length
        });
    } catch(err){
        console.error(err);
        return res.redirect('/');
    }
});

const country_list = ['Singapore', 'Malaysia', 'Korea', 'China', 'Thailand', 'Taiwan','Indonesia', 'India']

Router.get('/create', AccountChecker.isLoggedIn, AccountChecker.isUser, async function (req,res) {
    return res.render('address/createAddress',{
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        country_list
    });
});

Router.post('/create', AccountChecker.isLoggedIn, AccountChecker.isUser, async function(req,res){
    let errors = [];

    try {
        if ((req.body.countries.length < 1) || (req.body.address.length < 1) || (req.body.city.length < 1)
         || (req.body.state.length < 1) || (req.body.postalcode.length < 1) || (req.body.phoneno.length < 1)){
            errors.push({text: "Invalid Data (Empty)"});
        }
        if (!country_list.includes(req.body.countries)){
            errors.push({text: "Invalid country"});
        }

        if (!HelperFunctions.isNumeric(req.body.postalcode) || !HelperFunctions.isNumeric(req.body.phoneno)){
            errors.push({text: "Please insert only numbers in postal code & phone number fields"});
        }

        if (errors.length > 0){
            throw new Error("There are errors found!");
        }
        
    }catch(error){
        console.log("There are errors validating the create address form body");
        console.error(error);
        req.flash('errors', errors)
        return res.redirect('/user/address/create');
    }

    try {
        const address = await Address.create({
            Country: req.body.countries,
            Address: req.body.address,
            PostalCode: parseInt(req.body.postalcode),
            City: req.body.city,
            State: req.body.state,
            PhoneNo: parseInt(req.body.phoneno),
            userUUID: req.user.uuid
        });
        return res.redirect('/user/address/view');
    }catch(error) {
        console.log("Failed to create address");
        console.error(error);
        return res.status(500).end();
    }
});


module.exports = Router;