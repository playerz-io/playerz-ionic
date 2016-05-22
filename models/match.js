//match schema
'use strict'

var moogoose = require('mongoose');
var Schema = moogoose.Schema;


var MatchSchema = new Schema({
    against_team: String,
    place: String,
    type: String, //official pleasure
    score: String,
    date: Date,
    playerSelected: [{
        type: Schema.ObjectId,
        ref: 'Player'
    }],
    formation: String,
    schemaMatch: [],
    schemas: []

});

exports.schemaMatch = MatchSchema;
exports.modelMatch = moogoose.model('Match', MatchSchema);
