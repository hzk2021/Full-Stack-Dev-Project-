const DB = require('./database');
const UserModel = require('../models/User');
const Feedback = require('../models/Feedback');
const {RewardsList} = require('../models/RewardsList');
const {UserRewards} = require('../models/UserRewards');
const {Supplies} = require('../models/Supplies');
const {Cart} = require('../models/Cart');
const {Order} = require('../models/Order');
const {Menu} = require('../models/Menu');
const {Payment} = require('../models/Payment');
const {MenuCategory} = require('../models/MenuCategory');
const { SupplyCategory } = require('../models/SupplyCategory');
const { SupplyPerformance } = require('../models/SupplyPerformance');
const Entry = require('../models/Entry');
const Address = require('../models/Address')

/* Initialize Database using ORM(Sequelize) */
const InitializeDB = async function(drop){
    await DB.sequelize.authenticate();
    await console.log("Database Connected!");
    UserModel.User.hasMany(Feedback, {foreignKey: 'userUUID'});
    UserModel.User.hasMany(UserRewards, {foreignKey: 'uuid'});
    RewardsList.hasMany(UserRewards, {foreignKey: 'day_no'});
    SupplyCategory.hasMany(Supplies, {foreignKey: 'category_no'});
    Supplies.belongsTo(SupplyCategory, {foreignKey: 'category_no'});
    Supplies.hasMany(SupplyPerformance, {foreignKey: 'item_id'});
    SupplyCategory.hasMany(Supplies, {foreignKey: 'category_no'});
    Menu.belongsTo(MenuCategory, {foreignKey: 'category_no'});
    Entry.sync();
    UserModel.User.hasMany(Address, {foreignKey: 'userUUID'});
    
    // Havent convert to fk for menu cart order
    // UserModel.User.hasMany(Cart, {foreignKey: 'cart_user_id'});
    
    await DB.sequelize.sync({
        force: drop
    }).then(() => {
        console.log("Create tables if none exists")
    }).catch(err => console.log(err));
};

module.exports = {InitializeDB}