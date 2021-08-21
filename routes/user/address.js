const Express = require('express');
const Address = require('../../models/Address');
const Router = Express.Router();
const { Op, Model, json } = require('sequelize');
const AccountChecker = require('../../utilities/account_checker');
const HelperFunctions = require('../../utilities/helperFunctions');

/* Render view address template */
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

/* Render create address template */
Router.get('/create', AccountChecker.isLoggedIn, AccountChecker.isUser, async function (req,res) {
    return res.render('address/createAddress',{
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        country_list
    });
});

/* Post request to create a new address */
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

        req.flash('success_msg', "Address added successfully")
        return res.redirect('/user/address/view');
    }catch(error) {
        console.log("Failed to create address");
        console.error(error);
        return res.status(500).end();
    }
});

/* Render update address template */
Router.get('/update/:addressID/:country/:address/:city/:state/:postalcode/:phoneno/', AccountChecker.isLoggedIn, AccountChecker.isUser, async function (req,res) {
    return res.render('address/updateAddress',{
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        country_list,
        'addressID': req.params.addressID,
        'address': req.params.address,
        'country': req.params.country,
        'city': req.params.city,
        'state': req.params.state,
        'postalcode': req.params.postalcode,
        'phoneno': req.params.phoneno
    });
});

/* Post request to update specific address using addressID as the PK */
Router.post('/update/:addressID', AccountChecker.isLoggedIn, AccountChecker.isUser, async function (req,res){
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
        console.log("There are errors validating the update address form body");
        console.error(error);
        req.flash('errors', errors)
        return res.redirect('/user/address/update');
    }

    try {
        const address = await Address.update({
            Country: req.body.countries,
            Address: req.body.address,
            PostalCode: parseInt(req.body.postalcode),
            City: req.body.city,
            State: req.body.state,
            PhoneNo: parseInt(req.body.phoneno)
        }, {
            where: {
                addressID: req.params.addressID 
            }
        });

        req.flash('success_msg', "Address updated successfully")
        return res.redirect('/user/address/view');
    }catch(error) {
        console.log("Failed to update address");
        console.error(error);
        return res.status(500).end();
    }
});

/* Post request to delete address */
Router.post('/delete/:addressID', async function (req, res){
    const address_id = req.params.addressID;
    try {
        const address = await Address.findOne({
            where: {
                "addressID": address_id
            }
        })

        if (address){
            address.destroy();
            req.flash('success_msg', "Address deleted successfully!")
            return res.redirect('/user/address/view');
        }else{
            throw new Error("Invalid Address ID")
        }
    }catch(err) {
        console.error("There are errors deleting the address");
        console.log(err)
        req.flash('errors', "Invalid addressID")
        return res.redirect('/user/address/view');
    }
});


module.exports = Router;