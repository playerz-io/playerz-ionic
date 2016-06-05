//match schema
'use strict'

let moogoose = require('mongoose');
let Schema = moogoose.Schema;


let MatchSchema = new Schema({
    against_team: String,
    place: String,
    type: String, //official pleasure
    score: String,
    date: Date,
    status: String, //['comeup, finished']
    playerSelected: [{
        type: Schema.ObjectId,
        ref: 'Player'
    }],
    formation: String,
    schemaMatch: [],
    statistics : {
      ballPlayed: Number,
      ballLost: Number,
      passesCompletion  : Number,
      retrieveBalls: Number,
      defensiveAction: Number,
      relanceCompletion: Number,
      foulsSuffered: Number,
      foulsCommitted: Number,
      offSide: Number,
      attempts: Number,
      attemptsOnTarget: Number,
      attemptsOffTarget: Number,
      but: Number,
    },
    schemas: [],
    belongs_to: String,
    any: Schema.Types.Mixed

});

exports.schemaMatch = MatchSchema;
exports.modelMatch = moogoose.model('Match', MatchSchema);
