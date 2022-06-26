const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../models');
// const email = db.User.email

passport.use(
    new LocalStrategy(
        {
            usernameField: "username"
        },
        function (username, password, done) {
            User.findOne(
                {
                    where: {
                        username: username
                    }
                },
                function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false, { message: 'incorrect email' });
                    }
                    if (!user.verifyPassword(password)) {
                        return done(null, false, { message: 'incorrect password' });
                    }
                    console.log("hello world");
                    return done(null, user);
                }
            );
        }
    )
);



passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;