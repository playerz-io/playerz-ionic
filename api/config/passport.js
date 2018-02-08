'use strict'

let JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// load user model
let Coach = require('../models/coach');
// get db congig
let config = require('./database');

module.exports = function(passport) {
    let opts = {};
    opts.secretOrKey = config.secret;
    opts.jwtFromRequest = ExtractJwt.fromHeader();
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        Coach.modelCoach.findOne({
            id: jwt_payload.id
        }, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, null);
            }
        });
    }))
};
