//controllers
var getToken = require('./token');
var jwt = require('jwt-simple');
var config = require('../config/database');
var Player = require('../models/player').modelPlayer;
var Coach = require('../models/coach').modelCoach;
var Team = require('../models/team').modelTeam;

exports.addPlayer = function(req, res) {
    var token = getToken(req.headers);

    if (token) {
        var decoded = jwt.decode(token, config.secret);
        console.log(decoded);
        var newPlayer = new Player({
            last_name: req.body.last_name,
            first_name: req.body.first_name
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
    var token = getToken(req.headers);

    if (token) {
        var decoded = jwt.decode(token, config.secret);

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
    var token = getToken(req.headers);

    if (token) {
        var decoded = jwt.decode(token, config.secret);

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
    var token = getToken(req.headers);

    if (token) {
        Player.remove({
            _id: req.body._id
        }, function(err) {
            if (err)
                throw err;

            res.json({
                success: true,
                msg: 'Player removed'
            })
        })
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};
