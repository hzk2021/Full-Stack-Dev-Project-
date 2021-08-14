const Express = require('express');
const Entry = require('../../models/Entry');
const Router = Express.Router();
const { Op, Model } = require('sequelize');

const nricRegex = /^[STFG]\d{7}[A-Z]$/
const sgPhoneRegex = /^[0-9]{8}$/

Router.get('/create', async function(req,res) {
    res.render('entry/createEntry', {
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        'title': "Create Entry"
    });
});

Router.post('/create', async function(req,res){
    let errors = [];
    
    try {
        if (!nricRegex.test(req.body.nric)) {
            errors.push({text: "Invalid NRIC format provided!"});
        }

        if (!sgPhoneRegex.test(req.body.phoneno)){
            errors.push({text: "Invalid Phone Number format provided!"});
        }

        if (errors.length > 0){
            throw new Error("There are validation errors found!");
        }
    } catch(error) {
        console.error("There are errors with the entry form body");
        console.error(error);
        req.flash('errors', errors);
        return res.redirect('/admin/entry/create');
    }

    try {
        const entry = await Entry.create({
            FullName: String(req.body.fullname),
            NRIC: String(req.body.nric),
            PhoneNo: parseInt(req.body.phoneno),
            Temperature: parseFloat(req.body.temperature)
        });
        return res.redirect('/admin/entry/show');
    }catch(error) {
        console.log("Failed to create entry");
        console.error(error);
        return res.status(500).end();
    }
})

Router.get('/show', async function(req,res) {
    return res.render('entry/showEntries',{
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        'title': "View Customer Entries"
    });
});


Router.get('/list-data', async function(req, res) {
    console.log(req.query);
    const filterSearch = req.query.search;

    const condition = {
        [Op.or]: {
            "FullName": { [Op.substring]: filterSearch},
            "NRIC" : { [Op.substring]: filterSearch}, 
            "PhoneNo": { [Op.substring]: filterSearch},
            "Temperature": { [Op.substring]: filterSearch},
            "dateCreated": { [Op.substring]: filterSearch},
            "exitDate": { [Op.substring]: filterSearch},
        }
    };

    const totalFound = await Entry.count({
        where: condition
    });

    let entries_list = []
    try {
        entries_list = await Entry.findAll({
            where: condition,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            raw: true
        });

        for (let i = 0; i < entries_list.length; i++) {

            const exitDate = new Date(entries_list[i].exitDate)
            if (entries_list[i].exitDate != null){

                if(entries_list[i].dateCreated.toDateString() != entries_list[i].exitDate.toDateString()){
                    entries_list[i].exitDate = "11:59 pm";
                }
                else{
                    entries_list[i].exitDate = exitDate .toLocaleString('default', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }
            }

            const newDate = new Date(entries_list[i].dateCreated)
            entries_list[i].DOV = newDate.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
                day: 'numeric',
                weekday: 'long'
            })
            entries_list[i].dateCreated = newDate.toLocaleString('default', {
                hour: '2-digit',
                minute: '2-digit'
            })

        }
    } catch(error) {
        console.log("Error retrieving entries from Entry database");
        console.error(error);
    }

    return res.json({
        "total": totalFound,
        "rows": entries_list
    })
});

Router.post('/exit/:entryid', async function(req,res){
    let errors = []

    try {
        const entry = await Entry.findByPk(req.params.entryid);
        if (entry){
            const updateEntry = await Entry.update({
                exitDate: new Date()
            }, {
                where: {
                    entryID: entry.entryID
                }
            });
            return res.redirect('/admin/entry/show');
        }
        else{
            errors.push(`Entry with entry ID: ${req.params.entryid} was not found`);
        }

        if (error.length > 0){
            throw new Error("There are errors found.")
        }
    } catch(error){
        console.error("There are errors validating the entryID")
        console.error(error);
        req.flash('errors', error)
        return res.redirect('/admin/entry/show');
    }
});

module.exports = Router;