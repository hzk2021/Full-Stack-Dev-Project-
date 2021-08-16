const Express = require('express');
const Router = Express.Router();
const {User, UserRole} = require('../models/User');
const Hash = require('hash.js');
const Passport = require('passport');
const {isLoggedIn, isNotLoggedIn, isAdmin} = require('../utilities/account_checker');
const SendEmail = require('../utilities/send_email');

/* GET Login */
Router.get('/login', isNotLoggedIn, (req,res) => {
    res.render('authentication/login', {
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors')
    });
});

/* GET Register */
Router.get('/register', isNotLoggedIn, (req,res) =>{
    res.render('authentication/register', {
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors')
    });
});

Router.get('/logout', (req,res) => {
    req.logout();
    return res.redirect('/');
})


/* POST Login & Register */
Router.post('/login', isNotLoggedIn, login_process);
Router.post('/register', isNotLoggedIn, register_process);


/* Regex Validation Patterns */
const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regexName = /^[a-zA-Z][a-zA-Z]{2,}$/;
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


/** Login Process Function
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
 async function login_process(req,res, next){
    let errors = [];
    
    try {
        if (!regexEmail.test(req.body.email)) {
            errors.push({text: "Invalid email format provided!"});
        }

        if (!regexPassword.test(req.body.password)){
            errors.push({text: "Invalid password format provided!"});
        }

        if (errors.length > 0){
            throw new Error("There are validation errors found!");
        }
    } catch(error) {
        console.error("There are errors with the login form body");
        console.error(error);
        req.flash('errors', errors);
        return res.redirect('/auth/login');
    }

    return Passport.authenticate('local', {
       successRedirect: '/',
       failureRedirect: '/auth/login',
       failureFlash: true
    })(req,res,next);
}


/** Register Process Function
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
async function register_process(req,res){
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
        return res.redirect('/auth/register');
    }

    try {
        const user = await User.create({
            name: req.body.name, 
            email: req.body.email,
            eActive: false,
            password: Hash.sha256().update(req.body.password).digest("hex")
        });
        req.flash('success_msg', "Account has been created!\n A verification link has been sent to your email");
        SendEmail(user.email, 'Email Verification (CarlJr)', '' , `Hello ${user.name}, please click on this link to verify your account. <a href="http://127.0.0.1:5000/auth/verify/${user.uuid}">Click To Verify</a>`);
        return res.redirect('/auth/login');
    } catch(error){
        console.error(`Failed to create a new user: ${req.body.email}`);
        console.error(error);
        return res.status(500).end();
    }
}

Router.get('/verify/:uuid', isNotLoggedIn, async function(req,res){
    try {
        const user = await User.findByPk(req.params.uuid);
        if (user){
            if (user.eActive == 0){
                User.update({
                    eActive: 1
                },{
                    where: {
                        uuid: user.uuid
                    }
                })
                return res.render('verify/verified', {  
                    success_msg: req.flash('success_msg'),
                    error: req.flash('error'),
                    errors: req.flash('errors'),
                    'title': "Account verified",
                    'userName': user.name
                })

            }
            else {
                // already validated so ignore the URL
            }
        }

    } catch (err){

    }
});

module.exports = Router;