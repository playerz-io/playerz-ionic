//player schema
'use strict'

let extend = require('mongoose-schema-extend');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let user = require('./user');
let Statistics = require('./statistics').schemaStatistic;

let playerSchema = user.userSchema.extend({
    height: Number,
    weight: Number,
    sport: String,
    strong_foot: Number,
    country: String,
    position: String,
    favourite_position: String,
    team: String,
    division: String,
    category: String,
    statistics: [Statistics],
    any: Schema.Types.Mixed
})

exports.modelPlayer = mongoose.model('Player', playerSchema);
