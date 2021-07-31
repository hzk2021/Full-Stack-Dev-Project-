const Express = require('express');
const { User, UserRole} = require('../../models/User');
const Feedback = require('../../models/Feedback');
const Router = Express.Router();
const { Op, Model } = require('sequelize');
const { parse } = require('uuid');


Router.get('/list', async function(req,res) {
    return res.render('feedback/viewFeedback');
});

Router.get('/list-my-feedbacks', async function(req, res) {
    console.log(req.query);
    const filterSearch = req.query.search;

    const condition = {
        [Op.or]: {
            "feedbackID" : { [Op.substring]: filterSearch}, 
            "type": { [Op.substring]: filterSearch},
            "rating": { [Op.substring]: filterSearch},
            "description": { [Op.substring]: filterSearch},
            "userUUID" : req.user.uuid
        }
    };

    const totalFound = await Feedback.count({
        where: condition
    });

    let feedbacks_list = []
    try {
        feedbacks_list = await Feedback.findAll({
            where: condition,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            raw: true
        });
    } catch(error) {
        console.log("Error retrieving feedbacks from Feedback database");
        console.error(error);
    }

    return res.json({
        "total": totalFound,
        "rows": feedbacks_list
    })
});

module.exports = Router;