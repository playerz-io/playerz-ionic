//controllers
'use strict';


let jwt = require('jwt-simple');
let config = require('../config/database');
let Player = require('../models/player').modelPlayer;
let Coach = require('../models/coach').modelCoach;
let Team = require('../models/team').modelTeam;
let Utils = require('../utils');

exports.addPlayer = function(req, res) {

    let dataAuth = res.locals.data;
    let idCoach = dataAuth.id;
    let last_name = req.body.last_name;
    let first_name = req.body.first_name;
    let favourite_position = req.body.favourite_position;
    if (!last_name || !first_name || !favourite_position) {
        let msg = "Certain champs n'ont pas été saisis";
        return Utils.error(res, msg);
    }


    Coach.findById(idCoach, function(err, coach) {
        if (err)
            return Utils.errorIntern(res, err);

        let newPlayer = new Player({
            last_name: req.body.last_name,
            first_name: req.body.first_name,
            favourite_position: req.body.favourite_position,
            sport: coach.sport,
            division: coach.team.division,
            category: coach.team.category
        });

        newPlayer.save((err) => {
            if (err)
                return Utils.errorIntern(res, err);
        });

        coach.team.players.push(newPlayer);
        coach.save((err) => {
            if (err)
                return Utils.errorIntern(res, err);
        });
        let returnMsg = `${newPlayer.first_name} ${newPlayer.last_name} ajouté`;

        res.status(201).json({
            success: true,
            msg: returnMsg,
            newPlayer,
            team: coach.team
        });
    });
};

exports.getPlayers = function(req, res) {

    let dataAuth = res.locals.data;

    Coach
        .findById(dataAuth.id)
        .populate('team.players')
        .exec(function(err, coach) {
            if (err)
                return Utils.errorIntern(res, err);

            res.status(200).json({
                success: true,
                players: coach.team.players
            });
        });
};

//get player by ID
exports.getPlayerById = function(req, res) {

    Player.findById(req.params.id, function(err, player) {
        if (err)
            return Utils.errorIntern(res, err);

        res.status(200).json({
            success: true,
            player: player
        });
    });
};

//remove player by ID
exports.removePlayer = function(req, res) {

    let dataAuth = res.locals.data;
    let player_id = req.body._id;
    let coach_id = dataAuth.id;

    Player.findById(player_id, (err, playerRemoved) => {
        if (err)
            return Utils.errorIntern(res, err);

        Coach.findById(coach_id, function(err, coach) {
            if (err)
                return Utils.errorIntern(res, err);

            let players = coach.team.players;
            let findPlayer = players.indexOf(player_id);

            if (findPlayer >= 0) {
                players.splice(findPlayer, 1);
            } else {
                return res.status(200).json({
                    msg: 'player not exists'
                });
            }

            coach.save(function(err) {
                if (err)
                    return Utils.errorIntern(res, err);

                res.status(200).json({
                    player: players,
                    msg: `${playerRemoved.first_name} ${playerRemoved.last_name} a été supprimé`
                });

            });
        });

    });
};
