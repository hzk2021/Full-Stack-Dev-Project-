const Express = require('express');
const {UserRole} = require('../models/User')

/**
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
const isLoggedIn = function(req,res,next){
    if (req.isAuthenticated()){
        next();
    }else{
        res.redirect('/auth/login');
    }
};

/**
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
 const isNotLoggedIn = function(req,res,next){
    if (req.isAuthenticated() == null){
        next();
    }else{
        res.redirect('/');
    }
};

/**
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
const isAdmin = function(req,res,next){
    if (req.isAuthenticated()){
        if (req.user.role == UserRole.Admin){
            console.log(req.user.role);
            next();
        }
        else {
            res.send("Not an admin").end();
        }
    }else{
        res.redirect('/auth/login');
    }
}

module.exports = {isLoggedIn, isNotLoggedIn, isAdmin};