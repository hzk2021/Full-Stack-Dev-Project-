const {Sequelize, Model, NUMBER, DECIMAL} = require('sequelize');
const Database = require('../configs/database');

class Entry extends Model {
    get entryID() { return String(this.getDataValue("entryID")); }
    get FullName() { return String(this.getDataValue("FullName")); }
    get NRIC() { return String(this.getDataValue("NRIC")); }
    get PhoneNo(){ return Number(this.getDataValue("PhoneNo")); }
    get Temperature() { return DECIMAL(this.getDataValue("Temperature")); }
    get dateCreated() { return new Date(this.getDataValue("dateCreated")); }
    get dateUpdated() { return new Date(this.getDataValue("dateUpdated")); }
    get exitDate() { return new Date(this.getDataValue("exitDate")); }

    set entryID(uuid) { this.setDataValue("entryID", uuid); }
    set FullName(name) { this.setDataValue("FullName", name); }
    set NRIC(nric) { this.setDataValue("NRIC", nric); }
    set Temperature(temp) { this.setDataValue("Temperature", temp); }
    set exitDate(date) { this.setDataValue("exitDate", date); }
    
}

Entry.init({
    entryID: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    FullName: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    NRIC: {
        type: Sequelize.STRING(9),
        primaryKey: true,
        allowNull: false
    },
    PhoneNo: {
        type: Sequelize.BIGINT(8),
        allowNull: true
    },
    Temperature:{
        type: Sequelize.FLOAT(2,2),
        allowNull: false,
        defaultValue: 37.0
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
    exitDate: {
        type: Sequelize.DATE(),
        allowNull: true
    }
},{
    sequelize:Database.sequelize,
    modelName: 'Entry',
    hooks: {
        afterUpdate: auto_update_timestamp
    }
});

function auto_update_timestamp(user, options){
    Entry.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
}

module.exports = Entry;