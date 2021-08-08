const DB = require('./database');
const UserModel = require('../models/User');
const Feedback = require('../models/Feedback');
const {RewardsList} = require('../models/RewardsList');
const {UserRewards} = require('../models/UserRewards');
const {Supplies} = require('../models/Supplies');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const { SupplyCategory } = require('../models/SupplyCategory');
const { SupplyPerformance } = require('../models/SupplyPerformance');

/* Initialize Database using ORM(Sequelize) */
const InitializeDB = async function(drop){
    await DB.sequelize.authenticate();
    await console.log("Database Connected!");
    UserModel.User.hasMany(Feedback, {foreignKey: 'userUUID'});
    UserModel.User.hasMany(UserRewards, {foreignKey: 'userUUID'});
    RewardsList.hasMany(UserRewards, {foreignKey: 'day_no'});
    SupplyCategory.hasMany(Supplies, {foreignKey: 'category_no'});
    Supplies.belongsTo(SupplyCategory, {foreignKey: 'category_no'});
    Supplies.hasMany(SupplyPerformance, {foreignKey: 'item_id'});
    //Change line below accordingly to ur menu name if needed, uncomment it & delete this comment afterwards
    //Menu.hasMany(Ingredients);
    
    await DB.sequelize.sync({
        force: drop
    }).then(() => {
        console.log("Create tables if none exists")
    }).catch(err => console.log(err));
};

module.exports = {InitializeDB}