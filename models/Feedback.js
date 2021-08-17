const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');

class Feedback extends Model {
    get feedbackID() { return String(this.getDataValue("feedbackID")); }
    get type() { return String(this.getDataValue("type")); }
    get rating(){ return String(this.getDataValue("rating")); }
    get description() { return String(this.getDataValue("description")); }
    get dateCreated() { return new Date(this.getDataValue("dateCreated")); }
    get dateUpdated() { return new Date(this.getDataValue("dateUpdated")); }
    get response() { return new String(this.getDataValue("response")); }

    set feedbackID(uuid) { this.setDataValue("feedbackID", uuid); }
    set type(type) { this.setDataValue("type", type); }
    set rating(rating) { this.setDataValue("rating", rating); }
    set description(description) { this.setDataValue("description", description); }
    set response(response) { this.setDataValue("response", response); }
    
}

Feedback.init({
    feedbackID: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    dateCreated: {
        type: Sequelize.DATE(),
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    dateUpdated: {
        type: Sequelize.DATE(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    type:{
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Others"
    },
    rating: {
        type: Sequelize.FLOAT(11),
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
    response: {
        type: Sequelize.STRING(128),
        allowNull: true
    }
},{
    sequelize:Database.sequelize,
    modelName: 'Feedback',
    hooks: {
        afterUpdate: auto_update_timestamp
    }
});

function auto_update_timestamp(user, options){
    Feedback.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
}

module.exports = Feedback;