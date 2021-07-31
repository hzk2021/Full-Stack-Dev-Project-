const Express = require('express');
const { User, UserRole} = require('../../models/User');
const Router = Express.Router();
const { Op, Model } = require('sequelize');
const Hash = require('hash.js');

/* Regex Validation Patterns */
const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regexName = /^[a-zA-Z][a-zA-Z]{2,}$/;
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


Router.get('/list', async function(req,res) {
    return res.render('accounts/showAccounts');
});

Router.get('/list-data', async function(req,res) {
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
        console.log("Error retrieving accounts from User Database");
        console.error(error);
    }

    return res.json({
        "total": totalFound,
        "rows": users_list
    });
});

Router.get('/create', async function(req,res){
    res.render('accounts/createAccount', {
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors')
    });
});

Router.post('/create', async function(req,res) {
    let errors = [];
    
    try {
        if (!regexName.test(req.body.name)) {
            errors.push({text: "Invalid name provided! It must be minimum 3 characters and starts with an alphabet."});
        }

        if (!regexEmail.test(req.body.email)){
            errors.push({text: "Invalid email provided!"});
        }
        else{
            const user = await User.findOne({where: {email: req.body.email}});
            if (user != null){
                errors.push({text: "This email cannot be used!"});
            }
        }

        if (!regexPassword.test(req.body.password)){
            errors.push({text: "Password does not meet the minimum requirement. Please have at least 8 characters, 1 uppercase, 1 lowercase, and 1 number!"});
        }
        else if (req.body.password !== req.body.password2){
            errors.push({text: "Passwords do not match"});
        }

        if (errors.length > 0){
            throw new Error("There are errors found!");
        }
    } catch(error) {
        console.error("There are errors validating the registration form body");
        console.error(error);
        req.flash('errors', errors)
        return res.redirect('/admin/accounts/create');
    }

    try {
        const user = await User.create({
            name: req.body.name, 
            email: req.body.email,
            role: req.body.role,
            password: Hash.sha256().update(req.body.password).digest("hex")
        });
        return res.redirect('/admin/accounts/list');
    } catch(error){
        console.error(`Failed to create a new user: ${req.body.email}`);
        console.error(error);
        return res.status(500).end();
    }
});

Router.post('/delete/:id/', async function(req,res) {
    const user_uuid = req.params.id;

    if (user_uuid == "00000000-0000-0000-000000000000"){
        return res.send("cannot delete root account")
    }

    const currentAccountIsGod = (req.user.uuid == "00000000-0000-0000-000000000000");
    
    try{
        const user = await User.findByPk(user_uuid);
        const user_role = user.role;

        if (user) {
            if (currentAccountIsGod){
                user.destroy();
            }
            else {
                if (user_uuid == req.user.uuid) {
                    return res.send("cannot delete yourself")
                }
                else if (user_role == UserRole.Admin) {
                    return res.send("cannot delete other admin account")
                }
                else {
                    user.destroy();
                }
            }
        }
    }catch(error){
        console.log(`Error retrieving/deleting user with uuid: ${user_uuid}`);
        console.error(error);
    }


    return res.render('accounts/showAccounts');
});


module.exports = Router;
