'use strict';

let getToken = require('../token');
let jwt = require('jwt-simple');
let config = require('../../config/database');
let Match = require('../../models/match').modelMatch;
let Statistic = require('../../models/statistics').modelStatistic;
let real_time = require('../../real_time');


exports._addStatisticsToPlayer = function(player, match_id) {
    //  console.log('ok');
    player.statistics.push(new Statistic({
        match_id: match_id.toString(),
        assist: 0,
        retrieveBalls: 0,
        foulsSuffered: 0,
        foulsCommitted: 0,
        yellowCard: 0,
        redCard: 0,
        attemptsOnTarget: 0,
        attemptsOffTarget: 0,
        attempts: 0,
        beforeAssist: 0,
        matchPlayed: 0,
        firstTeamPlayer: 0,
        substitute: 0,
        but: 0,
        ballLost: 0,
        ballPlayed: 0,
        passesCompletion: 0,
        defensiveAction: 0,
        relanceCompletion: 0,
        offSide: 0,
        clean_sheet: 0,
        sorties_aeriennes: 0,
        claquettes: 0,
        saves: 0,
        crossesFailed: 0,
        passesFailed: 0
    }));

};

exports._findMatch = function(status, req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        let idCoach = decoded._id;

        Match.find({
            belongs_to: idCoach,
            status: status
        }, function(err, matchs) {
            if (err)
                throw err;

            res.status(201).json({
                success: true,
                matchs: matchs
            })

        })
    } else {
        return res.status(403).json({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports._defaultPosition = (player, idMatch, position, idCoach, playersSelected) => {
    let statExist = false;
    if (player.statistics.length === 0) {
        exports._addStatisticsToPlayer(player, idMatch);
    }
    for (let i = 0, x = player.statistics.length; i < x; i++) {
        if (player.statistics[i].match_id.toString() === idMatch.toString()) {
            statExist = true
        }
    }

    if (!statExist) {
        exports._addStatisticsToPlayer(player, idMatch);
        console.log('defaultPosition');
    }

    player.position = position;
    player.save();
    if (playersSelected.indexOf(player._id) < 0) {
        playersSelected.push(player);
    }
    real_time.addPlayerSelected_firebase(player, idMatch, idCoach);
};
