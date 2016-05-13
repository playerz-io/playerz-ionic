//model stastistic

'use strict'

var moogoose = require('mongoose');
var Schema = moogoose.Schema;
var StatisticSchema = new Schema({
    match_id: String,
    assist: Number,
    retrieveBalls: Number,
    foulsSuffered: Number,
    foulsCommitted: Number,
    yellowCard: Number,
    redCard: Number,
    attemptsOnTarget: Number,
    attemptsOffTarget: Number,
    beforeAssist: Number,
    matchPlayed: Number,
    firstTeamPlayer: false,
    substitute: false,
    but: Number,
    ballLost: Number,
    ballPLayed: Number,
    passesCompletion: Number,
    defensiveAction: Number,
    relanceCompletion: Number,
    offSide: Number,
    passesFailed: Number,
    crossesFailed: Number,
    saves: Number,
    claquettes: Number,
    sorties_aeriennes: Number,
    clean_sheet: Number

});

exports.schemaStatistic = StatisticSchema;
exports.modelStatistic = moogoose.model('Statistic', StatisticSchema);
