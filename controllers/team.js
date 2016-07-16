//controllers

'use strict';

let getToken = require('./token');
let jwt = require('jwt-simple');
let config = require('../config/database');
let Player = require('../models/player').modelPlayer;
let Coach = require('../models/coach').modelCoach;
let Team = require('../models/team').modelTeam;

exports.addPlayer = function(req, res) {
    let token = getToken(req.headers);

    let last_name =  req.body.last_name;
    let first_name = req.body.first_name;
    let favourite_position = req.body.favourite_position;

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        console.log(decoded);

        if( !last_name || !first_name  || !favourite_position){
          return res.status(403).json({
            success: false,
            msg: "Certain champs n'ont pas été saisis"
          });
        }
        let newPlayer = new Player({
            last_name: req.body.last_name,
            first_name: req.body.first_name,
            favourite_position: req.body.favourite_position
        });

        newPlayer.save(function(err, player) {
            if (err) {
                return res.json({
                    success: false,
                    msg: 'Error save player'
                });
            }
        });

        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                throw err;

            coach.team.players.push(newPlayer);
            coach.save();
            res.json({
                success: true,
                team: coach.team
            });
        });

    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};



exports.getPlayers = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Coach
            .findById(decoded._id)
            .populate('team.players')
            .exec(function(err, coach) {
                if (err)
                    throw err;

                res.json({
                    success: true,
                    players: coach.team.players
                });
            })
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};

//get player by ID
exports.getPlayerById = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Player.findById(req.params.id, function(err, player) {
            if (err)
                throw err;

            res.json({
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


//remove player by ID
exports.removePlayer = function(req, res) {
    let token = getToken(req.headers);

    if (token) {

        let decoded = jwt.decode(token, config.secret);
        let player_id = req.body._id;
        let coach_id = decoded._id;
        // Player.remove({
        //     _id: player_id
        // }, function(err) {
        //     if (err)
        //         throw err;
        // });

        Coach.findById(coach_id, function(err, coach) {
            if (err) {
                res.status(404).json({
                    error: err
                });
            }

            let players = coach.team.players;
            let findPlayer = players.indexOf(player_id);

            if (findPlayer >= 0) {
                players.splice(findPlayer, 1);
            } else {
                return res.status(202).json({
                    msg: 'player not exists'
                });
            }

            coach.save(function(err) {
                if (err)
                    res.status(404).json({
                        error: err
                    });

                res.status(202).json({
                    player: players,
                    msg: 'player removed'
                });

            });
        });

    } else {

        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};
