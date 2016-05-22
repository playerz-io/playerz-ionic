//match schema
'use strict'

let moogoose = require('mongoose');
let Schema = moogoose.Schema;


let MatchSchema = new Schema({
    against_team: {type: String, required: true},
    place: {type: String, required: true},
    type: String, //official pleasure
    score: String,
    date: Date,
    playerSelected: [{
        type: Schema.ObjectId,
        ref: 'Player'
    }],
    formation: String,
    schemaMatch: [],
    schemas: [],
    any: Schema.Types.Mixed

});

exports.schemaMatch = MatchSchema;
exports.modelMatch = moogoose.model('Match', MatchSchema);
