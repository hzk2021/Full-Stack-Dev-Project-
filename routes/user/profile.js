const Express = require('express');
const { User } = require('../../models/User');
const Router = Express.Router();
const AccountChecker = require('../../utilities/account_checker');
const Hash = require('hash.js');

const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/* Render edit profile template */
Router.get('/edit', AccountChecker.isLoggedIn, async function(req,res) {
    return res.render('profile/editprofile', {
        email_display: req.user.email,
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        'title': "Edit Profile"
    })
});

/* Post request to edit profile */
Router.post('/edit', AccountChecker.isLoggedIn, async function(req,res) {
    let errors = [];
    
    try {
        if (!regexPassword.test(req.body.password)){
            errors.push({text: "Invalid password format provided!"});
        }

        if (errors.length > 0){
            throw new Error("There are validation errors found!");
        }

        const user = await User.findOne({
            where: {
                email: req.user.email
            }
        });

        if (user){
            const updateUser = await User.update({
                password:  Hash.sha256().update(req.body.password).digest("hex")
            }, {
                where: {
                    email: req.user.email
                }
            });
            req.flash('success_msg', "Account updated successfully")
            return res.redirect("/")
        }
    }
    catch(error){
        console.error("There are errors validating the profile edit form body");
        console.error(error);
        req.flash('errors', errors)
        return res.redirect('/user/profile/edit');
    }
});

module.exports = Router;
