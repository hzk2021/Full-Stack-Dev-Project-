const Passport = require('passport');
const {Strategy} = require('passport-local');
const {User, UserRole} = require('../models/User');
const Hash = require('hash.js');

/* Initialize Passport Function */
const InitializePassport = function(server){
    Passport.use(LocalStrategy);
    Passport.serializeUser(Serialize_User);
    Passport.deserializeUser(Deserialize_User);
    server.use(Passport.initialize());
    server.use(Passport.session());
};

/* Set up LocalStrategy */
const LocalStrategy = new Strategy({usernameField: 'email', passwordField: 'password'},async function(email, password, done){
    try {
        const user = await User.findOne({where: {
            email: email,
            password: Hash.sha256().update(password).digest('hex')
        }});
        
        if (!user){
            throw new Error("Invalid user/password");
        } else{
           return done(null,user); 
        }

    } catch (error){
        console.error(`Failed to authenticate ${email}`);
        return done(null, false, {message: "Invalid login credentials"});
    }

});

/* Serialize to store UUID in Session => mySQL DB */
const Serialize_User = async function(user, done){
    return done(null, user.uuid);
};

/* Deserialize to retrieve user using UUID in Session table => mySQL DB */
const Deserialize_User = async function(uuid, done){
    try {
        const user = await User.findByPk(uuid);
        if (!user){
            throw new Error("Invalid user UUID");
        } else{
            return done(null, user)
        }
    } catch(error){
        console.error(`Failed to deserialize user ${uuid}`);
        console.error(error);
        return done(error, false);
    }
}

module.exports = {InitializePassport};