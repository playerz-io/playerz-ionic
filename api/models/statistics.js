//model stastistic

'use strict'

let moogoose = require('mongoose');
let Schema = moogoose.Schema;
let StatisticSchema = new Schema({
    match_id: String,
    assist: Number,
    retrieveBalls: Number,
    foulsSuffered: Number,
    foulsCommitted: Number,
    yellowCard: Number,
    redCard: Number,
    attemptsOnTarget: Number,
    attemptsOffTarget: Number,
    attempts: Number,
    beforeAssist: Number,
    matchPlayed: Number,
    firstTeamPlayer: false,
    substitute: false,
    but: Number,
    ballLost: Number,
    ballPlayed: Number,
    passesCompletion: Number,
    defensiveAction: Number,
    relanceCompletion: Number,
    offSide: Number,
    passesFailed: Number,
    crossesFailed: Number,
    saves: Number,
    dual_goalkeeper: Number,
    sorties_aeriennes: Number,
    clean_sheet: Number,
    penalty: Number,
    butsByPenalty: Number,
    butsByAttempts: Number,
    twoMinutes: Number,
    warning: Number,
    disqualification: Number,
    any: Schema.Types.Mixed

});

exports.schemaStatistic = StatisticSchema;
exports.modelStatistic = moogoose.model('Statistic', StatisticSchema);
