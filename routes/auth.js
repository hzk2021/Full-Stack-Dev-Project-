const Express = require('express');
const Router = Express.Router();
const User = require('../models/User');
const Hash = require('hash.js');

//Router.post('/login', login_process);

Router.post('/register', register_process);


const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regexName = /^[a-zA-Z][a-zA-Z]{2,}$/;
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


// /**
//  * 
//  * @param {Express.Request} req Express Request handle
//  * @param {Express.Response} res Express Response handle
//  */
//  async function login_process(req,res, next){
//     let errors = [];
    
//     try {
//         if (!regexEmail.test(req.body.email)) {
//             errors.push({text: "Invalid email format provided!"});
//         }

//         if (!regexPassword.test(req.body.password)){
//             errors.push({text: "Invalid password format provided!"});
//         }

//         if (errors.length > 0){
//             throw new Error("There are validation errors found!");
//         }
//     } catch(error) {
//         console.error("There are errors with the login form body");
//         console.error(error);
//         return res.render('authentication/login', {errors: errors});
//     }
//     // try {
//     //     const user = await User.findOne({ where: {
//     //         email: req.body.email,
//     //         password: Hash.sha256().update(req.body.password).digest("hex")
//     //     }
//     //     });
//     //     res.render('authentication/login', {success_msg: "Account has been created!"});
//     // } catch(error){
//     //     console.error(`Failed to create a new user: ${req.body.email}`);
//     //     console.error(error);
//     //     return res.status(500).end();
//     // }
// }


/**
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
        return res.render('authentication/register', {errors: errors});
    }

    try {
        const user = await User.create({
            name: req.body.name, 
            email: req.body.email,
            password: Hash.sha256().update(req.body.password).digest("hex")
        });
        res.render('authentication/login', {success_msg: "Account has been created!"});
    } catch(error){
        console.error(`Failed to create a new user: ${req.body.email}`);
        console.error(error);
        return res.status(500).end();
    }
}

module.exports = Router;