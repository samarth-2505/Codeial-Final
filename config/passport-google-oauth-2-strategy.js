const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');

passport.use(new googleStrategy({
        clientID : "295628776930-sa26hgl1l4sk2sitisg4t7sagcu8s3ft.apps.googleusercontent.com",
        clientSecret : "4jMC4-y3DLbwXuKiigwxF-Cs",
        callbackURL : "http://localhost:8000/users/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done){
        User.findOne({email : profile.emails[0].value}).exec(function(err,user){
            if(err){console.log("Error in finding user in google strategy passport !",err); return;}
            console.log(accessToken, refreshToken);
            console.log(profile);
            if(user){
                return done(null, user);
            }
            else{
                User.create({
                    email : profile.emails[0].value,
                    name : profile.displayName,
                    password : crypto.randomBytes(20).toString('hex')
                },function(err,user){
                    if(err){console.log("Error in creating user in google strategy passport !",err); return;}
                    return done(null, user);
                });
            }
        });
    }

));

module.exports = passport;