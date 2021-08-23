const Express = require('express');
const { UserRole } = require('../models/User')


/** Check if it's logged in
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
const isLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		return res.redirect('/auth/login');
	}
};

/** Check if it's not logged in
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
const isNotLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	} else {
		return next();
	}
};

/** Check if the account role is admin if it's logged in
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
const isAdmin = function (req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.role == UserRole.Admin) {
			return next();
		}
		else {
			console.log(`Current user is not privileged to access admin portal: ${req.user.uuid}`);
			return res.sendStatus(403).end();
		}
	} 
	else {
		console.log(`Either session expired or not logged in`);
		return res.redirect('/auth/login');
	}
}

/** Check if the account role is user if it's logged in
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
 const isUser = function (req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.role == UserRole.User) {
			return next();
		}
		else {
			console.log(`Current user is not privileged to access user portal: ${req.user.uuid}`);
			return res.sendStatus(403).end();
		}
	} 
	else {
		console.log(`Either session expired or not logged in`);
		return res.redirect('/auth/login');
	}
}

/** Check if the account role is supplier if it's logged in
 * 
 * @param {Express.Request} req Express Request handle
 * @param {Express.Response} res Express Response handle
 */
 const isSupplier = function (req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.role == UserRole.Supplier) {
			return next();
		}
		else {
			console.log(`Current user(supplier) is not privileged to access user portal: ${req.user.uuid}`);
			return res.sendStatus(403).end();
		}
	} 
	else {
		console.log(`Either session expired or not logged in`);
		return res.redirect('/auth/login');
	}
}

module.exports = { isLoggedIn, isNotLoggedIn, isAdmin, isUser, isSupplier};