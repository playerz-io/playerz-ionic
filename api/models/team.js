//team schema
'use strict'

let moogoose = require('mongoose');
let Schema = moogoose.Schema;
let Player = require('./player').modelPlayer;
let Match = require('./match').schemaMatch;

let TeamSchema = new Schema({
    name_club: {
        type: String,
        required: true
    },
    matchs: [Match],
    category: {
        type: String,
        required: true
    },
    division: {
        type: String,
        required: true
    },
    players: [{
        type: Schema.ObjectId,
        ref: 'Player'
    }],
    any: Schema.Types.Mixed

});



exports.schemaTeam = TeamSchema;
exports.modelTeam = moogoose.model('Team', TeamSchema);
