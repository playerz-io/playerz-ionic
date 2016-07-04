  //controller player
'use strict'

let realTime = require('../real_time');
let getToken = require('./token');
let jwt = require('jwt-simple');
let config = require('../config/database');
let Player = require('../models/player').modelPlayer;
let Match = require('../models/match').modelMatch;
let async = require('async');

exports.addPosition = function(req, res) {

    let position = req.body.position;
    let idPlayer = req.body.player_id;
    let idMatch = req.body.match_id;

    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let idCoach = decoded._id;


        Player.findById(idPlayer, function(err, player) {
            if (err)
                res.status(404).json({
                    error: err
                });

            console.log(player, idMatch, idCoach)
            player.position = position;
            realTime.updateStatistic_firebase(player, idMatch, idCoach, {
                first_name: player.first_name,
                last_name: player.last_name,
                id: player._id,
                favourite_position: player.favourite_position,
                position: position
            });
            player.save();

            res.status(201).json({
                success: true,
                player: player
            });
        })

    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports.getMatchPlayed = (req, res) => {

    let token = getToken(req.headers);
    let player_id = req.query.player_id;

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;
        async.waterfall([
            (cb) => {
                Player.findById(player_id, (err, player) => {
                    let matchPlayed = [];
                    let statistics = player.statistics
                    for (let stat of statistics) {
                        matchPlayed.push(stat.match_id);
                    }

                    cb(null, matchPlayed);
                })
            },

            (matchPlayed, cb) => {

                Match.find({
                    _id: {
                        "$in": matchPlayed
                    }, status: 'finished'
                }, (err, match) => {
                    if (err)
                        throw err;

                    cb(null, match);
                });
            },
        ], (err, matchs) => {
            if (err)
                throw err;
            res.status(202).json({
                success: true,
                matchs
            });
        });

    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};


exports.getStatisticsMatch = (req, res) => {

    let token = getToken(req.headers);
    let player_id = req.query.player_id;
    let match_id = req.query.match_id;

    if (token) {

        Player.findById(player_id, (err, player) => {

            if (err)
                throw err;

            let statistics = player.statistics;

            for (let stat of statistics) {
                if (stat.match_id = match_id) {
                    return res.status(202).json({
                        success: true,
                        stat
                    });
                }
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }


};
