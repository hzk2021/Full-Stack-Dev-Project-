const Express = require('express');
const Entry = require('../../models/Entry');
const Router = Express.Router();
const { Op, Model, where } = require('sequelize');

const nricRegex = /^[STFG]\d{7}[A-Z]$/
const sgPhoneRegex = /^[0-9]{8}$/

/* Render create entry form template  */
Router.get('/create', async function(req,res) {
    res.render('entry/createEntry', {
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        'title': "Create Entry"
    });
});

/* Post request to create a new entry */
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

/* Render show entries template */
Router.get('/show', async function(req,res) {
    return res.render('entry/showEntries',{
        success_msg: req.flash('success_msg'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        'title': "View Customer Entries"
    });
});

/* Return the data requested by bootstrap-table to display it */
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

/* Post request to change the exit time for a specific entry */
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

/* Render update entry form template */
Router.get('/update/:fname/:entryid/:nric/:phoneno/:temperature', async function(req,res){
    return res.render("entry/updateEntry", {
        "fName": req.params.fname,
        "entryID": req.params.entryid,
        "NRIC": req.params.nric,
        "phoneno": req.params.phoneno,
        "temperature": req.params.temperature,
        'title': "Update Entry"
    })
});

/* Post request to update entry */
Router.post('/update', async function(req,res){
    let errors = []

    try {
        const entry = await Entry.findByPk(req.body.entryID);

        if (entry){
            const updateEntry = await Entry.update({
                FullName: req.body.fullname,
                NRIC: req.body.nric,
                PhoneNo: req.body.phoneno,
                Temperature: req.body.temperature
            },{
                where: {
                    entryID: entry.entryID
                }
            });
            req.flash('success_msg', "Entry updated successfully!")
            return res.redirect("/admin/entry/show")
        }else{
            errors.push({text: "invalid entryID"})
        }

        if (errors.length > 0){
            throw new Error("There are validation errors found");
        }
    } catch(error){
        console.error("There are errors validating the entry update form body");
        console.error(error);
        req.flash('errors', errors)
        return res.redirect('/admin/entry/show');
    }
});

/* Post request to delete a specific entry using its entryID  */
Router.post('/delete/:entryid', async function (req, res){
    const entry_id = req.params.entryid;
    try {
        const entry = await Entry.findOne({
            where: {
                "entryID": entry_id
            }
        })

        if (entry){
            entry.destroy();
            req.flash('success_msg', "Entry deleted successfully!")
            return res.redirect('/admin/entry/show');
        }else{
            throw new Error("Invalid Error ID")
        }
    }catch(err) {
        console.error("There are errors deleting the entry");
        console.log(err)
        req.flash('errors', ["Invalid error ID"])
        return res.redirect('/admin/entry/show');
    }
});

module.exports = Router;