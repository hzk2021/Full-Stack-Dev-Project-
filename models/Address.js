const {Sequelize, Model, NUMBER, DECIMAL} = require('sequelize');
const Database = require('../configs/database');

class Address extends Model {
    get addressID() { return String(this.getDataValue("addressID")); }
    get Country() { return String(this.getDataValue("Country")); }
    get Address() { return String(this.getDataValue("Address")); }
    get PostalCode() { return String(this.getDataValue("PostalCode")); }
    get City() { return String(this.getDataValue("City")); }
    get State() { return String(this.getDataValue("State")); }
    get PhoneNo() { return new Date(this.getDataValue("PhoneNo")); }
    get dateCreated() { return new Date(this.getDataValue("dateCreated")); }
    get dateUpdated() { return new Date(this.getDataValue("dateUpdated")); }

    set Country(country) { this.setDataValue("Country", country); }
    set Address(addr) { this.setDataValue("Address", addr); }
    set PostalCode(postc) { this.setDataValue("PostalCode", postc); }
    set City(city) { this.setDataValue("City", city); }
    set State(state) { this.setDataValue("State", state); }
    set PhoneNo(phoneno) { this.setDataValue("PhoneNo", phoneno); }
}

Address.init({
    addressID: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    Country: {
        type: Sequelize.STRING(50),
        defaultValue: 'singapore'
    },
    Address: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    PostalCode: {
        type: Sequelize.BIGINT(30),
        allowNull: false
    },
    City: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    State: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    PhoneNo: {
        type: Sequelize.BIGINT(30),
        allowNull: true
    },
    dateCreated: {
        type: Sequelize.DATE(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    dateUpdated: {
        type: Sequelize.DATE(),
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
},{
    sequelize:Database.sequelize,
    modelName: 'Address',
    hooks: {
        afterUpdate: auto_update_timestamp
    }
});
function auto_update_timestamp(user, options){
    Entry.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
}

module.exports = Address;