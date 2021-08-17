const Express = require('express');
const Router = Express.Router();
const {User, UserRole} = require('../models/User');
const Hash = require('hash.js');
const Passport = require('passport');
const {isLoggedIn, isNotLoggedIn, isAdmin} = require('../utilities/account_checker');
const SendEmail = require('../utilities/send_email');
const crypto = require('crypto');
const { promisify } = require('util');
const { Op } = require('sequelize');

Router.get('/forgot', async function (req,res){
    return res.render('authentication/forgot', {
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
    });
});

Router.post('/forgot', async function (req,res,next) {
    const token = (await promisify(crypto.randomBytes)(20)).toString('hex');
    const user = await User.findOne({
        where: {
            email: req.body.email,
            eActive: {
                [Op.eq]: 1
            }
        }
    });

    if (!user) {
        req.flash('error', 'No account with that email address exists or it is not verified.')
        return res.redirect('/auth/forgot')
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hr
    await user.save();

    SendEmail(user.email, 'Password Reset (Carl Jr)', `You are receiving this because you (or someone else have requested for a password reset for your account.
        Please click on the following link, or paste this into your browser to complete the process:
        http://${req.headers.host}/auth/reset/${token} 
        Please ignore this email if you did not request this.`)

    req.flash('success_msg', `An email has been sent to ${user.email} with further instructions.`)
    return res.redirect('/auth/forgot');
    
});

Router.get('/reset/:token', async function (req,res){
    const user = await User.findOne({
        where: {
            resetPasswordExpires: {
                [Op.gt]: Date.now()
            },
            resetPasswordToken: req.params.token
        }
    });

    if (!user){
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/auth/forgot');
    }

    return res.render('authentication/reset', {
        
    })
});

Router.post('/reset/:token', async function(req,res){
    let errors = [];
    
    try {
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
        console.error("There are errors validating the reset password form body");
        console.error(error);
        req.flash('errors', errors)
        return res.redirect(`/auth/reset/${req.params.token}`);
    }

    const user = await User.findOne({
        where: {
            resetPasswordExpires: {
                [Op.gt]: Date.now()
            },
            resetPasswordToken: req.params.token
        }
    });

    if (!user){
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/auth/forgot');
    }

    user.password = Hash.sha256().update(req.body.password).digest("hex");
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    SendEmail(user.email, 'You password has been changed', `Hello ${user.name}, this is a confirmation to let you know that the password for your account was recently changed.`);
    req.flash('success_msg', 'Success! Your password has been changed!!');
    return res.redirect('/auth/login');
});

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
        SendEmail(user.email, 'Email Verification (CarlJr)', `Hello ${user.name}, please click on this link to verify your account:
            http://${req.headers.host}/auth/verify/${user.uuid}`)
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