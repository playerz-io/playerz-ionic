//user schema

'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt');


//User model
let UserSchema = new Schema({

    id_facebook: String,
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    connected: String, // facebook or jwt
    country: String,
    description: String,
    genre: String,
    birth_date: Date,
    created_at: Date,
    sport: String,
    type: String, // coach, player
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    total_connexion: Number,
    token_stripe: String,
    image_url: String,
    website_club: String,
    website_perso: String,
    number_tel: String,
    any: Schema.Types.Mixed
});

//trigger before save user schema
UserSchema.pre('save', function(next) {
    let user = this;
    if (user.password) {
        //check si le mdp est change et si oui il le crypte
        if (this.isModified('password') || this.isNew) {
            bcrypt.genSalt(10, function(err, salt) {
                if (err) {
                    return next(err);
                }
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if (err) {
                        return next(err);
                    }
                    user.password = hash;
                    next();
                });
            });
        } else {
            return next();
        }
    } else {
        return next();
    }

});

UserSchema.methods.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

//rend visible le shema cree partt ds l api
exports.userSchema = UserSchema;
