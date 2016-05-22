//player schema
'use strict'

var extend = require('mongoose-schema-extend');
var mongoose = require('mongoose');
var user = require('./user');
var Statistics = require('./statistics').schemaStatistic;

var playerSchema = user.userSchema.extend({
    height: Number,
    weight: Number,
    strong_foot: Number,
    country: String,
    position: String,
    team: String,
    statistics: [Statistics]
})

exports.modelPlayer = mongoose.model('Player', playerSchema);
