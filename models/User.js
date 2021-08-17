const {Sequelize, Model} = require('sequelize');
const Database = require('../configs/database');
const uuid = require('uuid');
const Hash = require('hash.js');

const UserRole = {
    Admin: "admin",
    User: "user",
    Supplier: "supplier"
};

class User extends Model{
    get uuid() { return String(this.getDataValue("uuid")); }
    get name() { return String(this.getDataValue("name")); }
    get role(){ return String(this.getDataValue("role")); }
    get email() { return String(this.getDataValue("email")); }
    get eActive() { return String(this.getDataValue("eActive")); }
    get dateCreated() { return new Date(this.getDataValue("dateCreated")); }
    get dateUpdated() { return new Date(this.getDataValue("dateUpdated")); }
    get resetPasswordToken() { return new String(this.getDataValue("resetPasswordToken")); }
    get resetPasswordExpires() { return new parseInt(this.getDataValue("resetPasswordExpires")); }

    set uuid(uuid) { this.setDataValue("uuid", uuid); }
    set name(name) { this.setDataValue("name", name); }
    set email(email) { this.setDataValue("email", email); }
    set eActive(b00l) { this.setDataValue('eActive', b00l); }
    set resetPasswordToken(token) { this.setDataValue("resetPasswordToken", token); }
    set resetPasswordExpires(timetick) { this.setDataValue('resetPasswordExpires', timetick); }
    
}

User.init({
    uuid: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    name: {
        type: Sequelize.STRING(64),
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
    eActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false
    },
    role: {
        type: Sequelize.ENUM,
        values: [UserRole.Admin, UserRole.User, UserRole.Supplier],
        allowNull: false,
        defaultValue: UserRole.User
    },
    password: {
        type: Sequelize.STRING(64),
        allowNull: false
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
    resetPasswordToken: {
        type: Sequelize.STRING(50),
    },
    resetPasswordExpires: {
        type: Sequelize.DATE()
    }
}, {
    sequelize: Database.sequelize,
    modelName: 'User',
    hooks: {
        afterUpdate: auto_update_timestamp
    }
});

User.sync();

function auto_update_timestamp(user, options){
    user.dateUpdated = Sequelize.literal('CURRENT_TIMESTAMP');
}

User.addHook("afterBulkSync", generate_root_account.name, generate_root_account());

async function generate_root_account(){
    User.removeHook("afterBulkSync", generate_root_account.name);
    
    try {
        console.log("Generating root administrator account");
        const root_parameters = {
            uuid    : "00000000-0000-0000-000000000000",
            name    : "root",
            email   : "root@mail.com",
            eActive : true,
            role    : UserRole.Admin,
            password: Hash.sha256().update("P@ssw0rd").digest("hex")
        };

        var account = await User.findOne( {where: {"uuid": root_parameters.uuid }});
        account = await ((account) ? account.update(root_parameters): User.create(root_parameters))

        console.log("== Generated root account ==");
        console.log(account.toJSON());
        console.log("============================");
        return Promise.resolve();
    }
    catch (err){
        console.error("Failed to generate root administrator user account");
        console.error(err);
        return Promise.reject(err);
    }
}

module.exports = {User, UserRole};
