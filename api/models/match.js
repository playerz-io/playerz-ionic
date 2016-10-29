//match schema
'use strict'

let moogoose = require('mongoose');
let Schema = moogoose.Schema;


let MatchSchema = new Schema({
    team: String,
    against_team: String,
    place: String,
    type: String, //official pleasure
    score: String,
    date: Date,
    sport: String,
    status: String, //['comeup, finished']
    result: String, //['victory, defeat, draw']
    playerSelected: [{
        type: Schema.ObjectId,
        ref: 'Player'
    }],
    playerNoSelected: [{
        type: Schema.ObjectId,
        ref: 'Player'
    }],
    formation: String,
    schemaMatch: [],
    statistics : {
      totalBallPlayed: Number,
      totalBallLost: Number,
      totalRetrieveBalls  : Number,
      totalFoulsSuffered: Number,
      totalFoulsCommited: Number,
      totalOffSide: Number,
      totalAttempts: Number,
      totalAttemptsOnTarget: Number,
      totalAttemptsOffTarget: Number,
      totalBut: Number,
      totalPassesCompletion: Number,
      totalRelanceCompletion: Number,
      totalRedCard: Number,
      totalYellowCard: Number,
      but_opponent: Number,
      totalPassesFailed: Number,
      totalDefensiveAction: Number,
      clean_sheet: Number,
      totalDisqualification: Number,
      totalWarning: Number,
      totalTwoMinutes: Number,
      totalButsByPenalty: Number,
      totalButsByAttemps: Number,
      totalPenalty: Number

    },
    schemas: [],
    belongs_to: String,
    defaultPosition: Boolean,
    actions: [],
    any: Schema.Types.Mixed

});

exports.schemaMatch = MatchSchema;
exports.modelMatch = moogoose.model('Match', MatchSchema);
