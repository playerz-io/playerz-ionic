//controller player
'use strict'

let realTime = require('../real_time');
let getToken = require('./token');
let jwt = require('jwt-simple');
let config = require('../config/database');
let Player = require('../models/player').modelPlayer;
let Match = require('../models/match').modelMatch;
let Coach = require('../models/coach').modelCoach;
let async = require('async');

exports.addPosition = function(req, res) {

    let data = res.locals.data;
    let position = req.body.position;
    let idPlayer = req.body.player_id;
    let idMatch = req.body.match_id;
    let idCoach = data.id;

    Player.findById(idPlayer, function(err, player) {

        if (err)
            return Utils.errorIntern(res, err);

        player.position = position;
        realTime.updateStatistic_firebase(player, idMatch, idCoach, {
            first_name: player.first_name,
            last_name: player.last_name,
            id: player._id,
            favourite_position: player.favourite_position,
            position: position
        });
        player.save((err) => {
            if (err)
                return Utils.errorIntern(res, err);
        });

        res.status(201).json({
            success: true,
            player: player
        });
    });
};

exports.getMatchPlayed = (req, res) => {

    let data = res.locals.data;
    let player_id = req.query.player_id;
    let coach_id = data.id;

    async.waterfall([

        (cb) => {
            Coach.findById(coach_id, (err, coach) => {

                if (err)
                    return Utils.errorIntern(res, err);

                let matchPlayed = [];
                let matchs = coach.team.matchs;

                for (let match of matchs) {
                    let playerSelected = match.playerSelected;

                    if (playerSelected.indexOf(player_id) >= 0) {
                        matchPlayed.push(match._id);
                    }
                }
                cb(null, matchPlayed);
            });
        },
        (matchPlayed, cb) => {

            Match.find({
                _id: {
                    "$in": matchPlayed
                },
                status: 'finished'
            }, (err, match) => {
                if (err)
                    return Utils.errorIntern(res, err);

                cb(null, match);
            });
        }
    ], (err, matchs) => {
        if (err)
            return Utils.errorIntern(res, err);
        res.status(202).json({
            success: true,
            matchs
        });
    });
};


exports.getStatisticsMatch = (req, res) => {

    let data = res.locals.data;
    let player_id = req.query.player_id;
    let match_id = req.query.match_id;

    Player.findById(player_id, (err, player) => {

        if (err)
            return Utils.errorIntern(res, err);

        let statistics = player.statistics;

        for (let stat of statistics) {
            if (stat.match_id === match_id) {
                return res.status(202).json({
                    success: true,
                    stat
                });
            }
        }
    });
};

exports.getGlobalStatistics = (req, res) => {

    let data = res.locals.data;
    let player_id = req.query.player_id;

    let statisticsGlobal = {
        "passesFailed": 0,
        "crossesFailed": 0,
        "saves": 0,
        "dual_goalkeeper": 0,
        "sorties_aeriennes": 0,
        "clean_sheet": 0,
        "offSide": 0,
        "relanceCompletion": 0,
        "defensiveAction": 0,
        "passesCompletion": 0,
        "ballPlayed": 0,
        "ballLost": 0,
        "but": 0,
        "substitute": 0,
        "firstTeamPlayer": 0,
        "matchPlayed": 0,
        "beforeAssist": 0,
        "attempts": 0,
        "attemptsOffTarget": 0,
        "attemptsOnTarget": 0,
        "redCard": 0,
        "yellowCard": 0,
        "foulsCommitted": 0,
        "foulsSuffered": 0,
        "retrieveBalls": 0,
        "assist": 0,
    };

    let keyStatisticsGlobal = Object.keys(statisticsGlobal);
    let coach_id = data.id;

    async.waterfall([

        (cb) => {
            Coach.findById(coach_id, (err, coach) => {
                if (err)
                    return Utils.errorIntern(res, err);
                let matchPlayed = [];
                let matchs = coach.team.matchs;
                for (let match of matchs) {
                    let playerSelected = match.playerSelected;
                    if (playerSelected.indexOf(player_id) >= 0) {
                        matchPlayed.push(match._id);

                    }
                }

                cb(null, matchPlayed);
            });
        },
        (matchPlayed, cb) => {
            Player.findById(player_id, (err, player) => {

                let statistics = player.statistics;
                //convert array object in array string
                let matchPlayedString = matchPlayed.map(String);

                for (let stat of statistics) {

                    if (matchPlayedString.indexOf(stat.match_id) >= 0) {

                        for (let key of keyStatisticsGlobal) {
                            statisticsGlobal[key] += stat[key];
                        }
                    }
                }
                console.log(statisticsGlobal.passesCompletion, matchPlayed.length);
                statisticsGlobal.passesCompletion = Math.round(statisticsGlobal.passesCompletion / matchPlayed.length);
                statisticsGlobal.relanceCompletion = Math.round(statisticsGlobal.relanceCompletion / matchPlayed.length);

                cb(null, statisticsGlobal, matchPlayed);
            });

        }
    ], (err, matchs, matchPlayed) => {
        if (err)
            return Utils.errorIntern(res, err);

        res.status(202).json({
            success: true,
            statisticsGlobal,
            nbrMatchPlayed: matchPlayed.length
        });
    });
};
// TODO: best player
// let getBestGoal = (players) => {
//
//   Player.find({
//     _id: { "$in": players }
//   }, (err, player) => {
//     if (err) {
//       return Utils.errorIntern(res, err);
//     }
//   })
//   .sort({ 'statistics.assist': 'asc'})
//   .exec((err, result) => {
//     console.log(result);
//   });
// };
//
// exports.getBestPlayer = (req, res) => {
//
//     let data     = res.locals.data;
//     let coach_id = data.id;
//
//     Coach.findById(coach_id, (err, coach) => {
//       if (err) {
//         return Utils.errorIntern(res, err);
//       }
//       let players = coach.team.players;
//       getBestGoal(players);
//       res.status(202).json({
//         players
//       });
//     });
// }
