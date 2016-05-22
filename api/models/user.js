//user schema

'use strict'

let moogoose = require('mongoose');
let Schema = moogoose.Schema;
let bcrypt = require('bcrypt');


//User model

let UserSchema = new Schema({

    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    connected: {
        type: String,
        required: true,
        enum: ['jwt', 'facebook']

    }, // facebook or jwt

    country: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        required: true
    },
    sport: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['coach', 'player']
    }, // coach, player
    any: Schema.Types.Mixed

});

//trigger before sava user schem
UserSchema.pre('save', function(next) {
    let user = this;

    if (user.password) {
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


exports.userSchema = UserSchema;
