const Express = require('express');
const Feedback = require('../../models/Feedback');
const Router = Express.Router();
const { Op, Model } = require('sequelize');
const { uuid } = require('uuid');


Router.get('/list', async function(req,res) {
    return res.render('feedback/viewFeedbackAdmin',{
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        'title': "View Users Feedbacks"
    });
});

Router.get('/list-users-feedbacks', async function(req, res) {
    console.log(req.query);
    const filterSearch = req.query.search;

    const condition = {
        [Op.or]: {
            "byUser": { [Op.substring]: filterSearch},
            "feedbackID" : { [Op.substring]: filterSearch}, 
            "type": { [Op.substring]: filterSearch},
            "rating": { [Op.substring]: filterSearch},
            "description": { [Op.substring]: filterSearch},
            "response": { [Op.substring]: filterSearch}
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

Router.get('/respond/:feedbackid/', async function(req,res){
    return res.render("feedback/respondFeedback", {
        "feedbackID": req.params.feedbackid,
        'title': "Respond to feedback"
    })
});

Router.post('/respond', async function(req,res){
    let errors = []

    try {
        const feedback = await Feedback.findOne({
            where: {
                feedbackID: req.body.feedbackID
            }
        })

        if (feedback){
            const updateFeedback = await Feedback.update({
                response: req.body.message
            },{
                where: {
                    feedbackID: req.body.feedbackID
                }
            });
            req.flash('success_msg', "Replied to feedback successfully")
            return res.redirect("/admin/feedback/list")
        }else{
            errors.push({text: "invalid feedbackID"})
        }

        if (errors.length > 0){
            throw new Error("There are validation errors found");
        }
    } catch(error){
        console.error("There are errors validating the feedback update/respond form body");
        console.error(error);
        req.flash('errors', errors)
        return res.redirect('/admin/feedback/respond');
    }
});

module.exports = Router;