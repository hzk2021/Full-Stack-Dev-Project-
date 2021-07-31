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
    UserModel.User.hasMany(Feedback);
    UserModel.User.hasMany(UserRewards);
    RewardsList.hasMany(UserRewards);
    Supplies.belongsTo(SupplyCategory);
    Supplies.belongsTo(SupplyPerformance);
    // SupplyCategory.hasMany(Supplies);
    // SupplyPerformance.hasMany(Supplies);
    //Change line below accordingly to ur menu name if needed, uncomment it & delete this comment afterwards
    //Menu.hasMany(Ingredients);
    
    await DB.sequelize.sync({
        force: drop
    }).then(() => {
        console.log("Create tables if none exists")
    }).catch(err => console.log(err));
};

module.exports = {InitializeDB}
