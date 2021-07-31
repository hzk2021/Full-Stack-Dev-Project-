const Express = require('express');
const { User, UserRole} = require('../../models/User');
const Feedback = require('../../models/Feedback');
const Router = Express.Router();
const { Op, Model } = require('sequelize');
const { uuid } = require('uuid');


Router.get('/create', async function(req,res) {
    res.render('feedback/createFeedback', {
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors')
    });
});

Router.post('/create', async function(req,res){
    let errors = [];
    try {
        if (parseFloat(req.body.rating) < 0 || parseFloat(req.body.rating) > 5){
            errors.push({text: "Please only insert rating between 0 to 5"});
        }
        const t = String(req.body.types);
        if (t != "compliment" && t != "complaint" && t != "suggestion" && t != "others"){
            errors.push({text: "Please insert a valid feedback type"});
        }

        if (errors.length > 0){
            throw new Error("There are errors found!");
        }
        
    }catch(error){
        console.log("There are errors validating the feedback form body");
        console.error(error);
        req.flash('errors', errors)
        return res.redirect('/user/feedback/create');
    }

    try {
        const feedback = await Feedback.create({
            type: req.body.types,
            rating: parseFloat(req.body.rating),
            description: req.body.description,
            userUUID: req.user.uuid
        });
        return res.redirect('/user/feedback/list');
    }catch(error) {
        console.log("Failed to create feedback");
        console.error(error);
        return res.status(500).end();
    }
});


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
            "description": { [Op.substring]: filterSearch}
        },
        "userUUID" : req.user.uuid
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