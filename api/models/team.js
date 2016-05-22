//team schema
'use strict'

var moogoose = require('mongoose');
var Schema = moogoose.Schema;
var Player = require('./player').modelPlayer;
var Match = require('./match').schemaMatch;

var TeamSchema = new Schema({
    name_club: String,
    matchs: [Match],
    category: String,
    division: String,
    players: [{type: Schema.ObjectId, ref: 'Player'}]
    
});



exports.schemaTeam = TeamSchema;
exports.modelTeam = moogoose.model('Team', TeamSchema);
