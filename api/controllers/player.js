//controller player
'use strict'

let realTime = require('../real_time');
let getToken = require('./token');
let jwt = require('jwt-simple');
let config = require('../config/database');
let Player = require('../models/player').modelPlayer;

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
