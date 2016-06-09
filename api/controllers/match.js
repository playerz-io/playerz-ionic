//controller match
'use strict'

let getToken = require('./token');
let jwt = require('jwt-simple');
let config = require('../config/database');
let Match = require('../models/match').modelMatch;
let Coach = require('../models/coach').modelCoach;
let Player = require('../models/player').modelPlayer;
let Statistic = require('../models/statistics').modelStatistic;
let real_time = require('../real_time');
let async = require('async');




exports.addMatch = function(req, res) {
    let token = getToken(req.headers);

    let against_team = req.body.against_team;
    let place = req.body.place;
    let type = req.body.type;
    let date = req.body.date;


    if (token) {
        let decoded = jwt.decode(token, config.secret);

        let idCoach = decoded._id;

        if (!against_team || !place || !type || !date) {
            return res.status(403).json({
                success: false,
                msg: "Certains champs n'ont pas été saisies"
            });
        }

        let newMatch = new Match({
            against_team: against_team,
            place: place,
            type: type,
            date: date,
            belongs_to: idCoach,
            status: 'comeup'

        });

        newMatch.save(function(err, match) {
            if (err) {
                return res.json({
                    success: false,
                    msg: 'Error save match'
                });
            }
        });

        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                throw err;

            console.log(coach.team.matchs);
            coach.team.matchs.push(newMatch);
            coach.save();
            res.json({
                success: true,
                match: coach.team.matchs
            });

        });


    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }

};

exports.getMatchs = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                throw err;

            res.json({
                success: true,
                matchs: coach.team.matchs
            });
        });
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports.getMatchById = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                throw err;

            let match = coach.team.matchs.id(req.params.id);
            res.json({
                success: true,
                match: match
            });
        });
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
}

exports.removeMatch = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);


        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                throw err;

            Match.remove({
                _id: req.body.id
            }, function(err, ok) {
                console.log(err, ok);
            });

            coach.team.matchs.id(req.body.id).remove();
            coach.save();
            res.json({
                success: true,
                match: coach.team.matchs
            });
        });

    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports.addFormation = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                throw err;

            let match = coach.team.matchs.id(req.body.id);
            console.log(match);
            match.formation = req.body.formation;
            coach.save();

            res.json({
                success: true,
                match: match
            });
        });

    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports.getTactique = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let tactique = req.query.tactique;
        console.log(tactique)
        if (tactique === '4-4-2') {
            res.json({
                success: true,
                tactique: [{
                    post: 'GD'
                }, {
                    post: 'ARD'
                }, {
                    post: 'ARG'
                }, {
                    post: 'DFG'
                }, {
                    post: 'DFD'
                }, {
                    post: 'MCD'
                }, {
                    post: 'MCG'
                }, {
                    post: 'MD'
                }, {
                    post: 'MG'
                }, {
                    post: 'ATD'
                }, {
                    post: 'ATG'
                }, {
                    post: 'REM'
                }]
            });
        } else if (tactique === '4-3-3') {
            res.json({
                success: true,
                tactique: [{
                    post: 'GD'
                }, {
                    post: 'ARD'
                }, {
                    post: 'ARG'
                }, {
                    post: 'DFG'
                }, {
                    post: 'DFD'
                }, {
                    post: 'MC'
                }, {
                    post: 'MCG'
                }, {
                    post: 'MCD'
                }, {
                    post: 'AV'
                }, {
                    post: 'ATD'
                }, {
                    post: 'ATG'
                }, {
                    post: 'REM'
                }]
            });
        } else {
            res.json({
                success: false
            });
        }
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports.removePlayerSelected = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let player_id = req.body.player_id;
        let match_id = req.body.match_id;

        Player.findById(player_id, function(err, player) {
            if (err)
                res.status(404).json({
                    error: err
                });

            Coach.findById(decoded._id, function(err, coach) {
                if (err) {
                    res.status(404).json({
                        error: err
                    });
                }

                let playersSelected = coach.team.matchs
                    .id(match_id)
                    .playerSelected;

                let findPlayer = playersSelected.indexOf(player_id);

                if (findPlayer >= 0) {
                    real_time.removePlayerSelected_firebase(player, match_id, decoded._id);
                    playersSelected.splice(findPlayer, 1);

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
                        player: player,
                        playerSelected: playersSelected,
                        msg: 'player removed'
                    });
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

exports.addPlayerSelected = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let player_id = req.body.player_id;
        let match_id = req.body.match_id;
        let position = req.body.position;


        async.waterfall([
            (cb) => {

                Coach.findById(decoded._id, (err, coach) => {
                    if (err)
                        throw err;

                    let playerSelected = coach.team.matchs.id(match_id).playerSelected;
                    let formation = coach.team.matchs.id(match_id).formation;
                    let findPlayer = playerSelected.indexOf(player_id); // return -1 if player not exist else return value >= 0
                    let numberPlayerSelected = playerSelected.length;

                    cb(null, playerSelected, formation, findPlayer, numberPlayerSelected, coach);

                });
            },

            (playerSelected, formation, findPlayer, numberPlayerSelected, coach, cb) => {



                Player.find({
                    _id: {
                        "$in": playerSelected
                    }
                }, (err, playerPosition) => {

                    Player.findById(player_id, (err, mainPlayer) => {

                        for (let player of playerPosition) {

                            // check if there are 11 players on the pitch
                            if ((numberPlayerSelected >= 11) && (findPlayer < 0) && (position !== 'REM')) {
                                console.log("numberPlayerSelected : " + numberPlayerSelected);
                                return res.status(201).json({
                                    success: false,
                                    msg: 'Vous avez dejà 11 joueurs sur le terrain'
                                });
                            }
                            // check if two players are the same position
                            console.log(player_id, player._id);
                            if (player.position === position && position !== 'REM' && player._id.toString() !== player_id.toString()) {
                                return res.status(201).json({
                                    success: false,
                                    msg: `Attention
                                    ${player.first_name} ${player.last_name} et ${mainPlayer.first_name} ${mainPlayer.last_name}
                                    ont le même poste`
                                });
                            }
                        }
                        cb(null, playerSelected, formation, findPlayer, numberPlayerSelected, coach, cb);
                    });
                });
            },

            (playerSelected, formation, findPlayer, numberPlayerSelected, coach, cb) => {

                Player.findById(player_id, (err, player) => {
                    if (err)
                        throw err;

                    //change position of player even if he is already added
                    player.position = position;
                    player.save();
                    real_time.updateStatistic_firebase(player, match_id, decoded._id, {
                        first_name: player.first_name,
                        last_name: player.last_name,
                        id: player._id,
                        position: position,
                    });

                    //check if user already exist
                    if (findPlayer === -1) {

                        // if array stat is empty add stat
                        if (player.statistics.length === 0) {
                            //add stastistic to player
                            addStatisticsToPlayer(player, match_id);
                        } else {

                            // if array stat is not empty check if stat with
                            // match_id already exist
                            let statExist = false;
                            for (let i = 0, x = player.statistics.length; i < x; i++) {
                                if (player.statistics[i].match_id.toString() === match_id.toString())
                                    statExist = true;
                            }

                            if (!statExist) {
                                //add stastistic to player
                                addStatisticsToPlayer(player, match_id);
                            }
                        }

                        if (formation === '4-4-2') {
                            /************* add verif position ***********************/

                            real_time.addPlayerSelected_firebase(player, match_id, decoded._id);
                            playerSelected.push(player);
                            player.save();
                            coach.save();
                            return res.status(201).json({
                                success: true,
                                player: player,
                                playersSelected: playerSelected,
                                msg: 'Joueur ajouté'
                            });
                        }
                    } else {

                        return res.status(201).json({
                            success: false,
                            msg: 'Ce joueur a déjà été ajouté',
                            playersSelected: playerSelected
                        });
                    }


                });

            }
        ]);
    } else {
        res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });

    }
};


exports.getPlayerSelected = function(req, res) {

    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id)
            .populate('team.matchs.playerSelected')
            .exec(function(err, coach) {
                if (err)
                    res.status(404).json({
                        error: err
                    });

                let playerSelected = coach.team.matchs.id(req.query.match_id).playerSelected;

                res.status(201).json({
                    success: true,
                    playerSelected: playerSelected
                });

            });

    } else {
        res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};

let addStatisticsToPlayer = function(player, match_id) {
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

}

let findMatch = function(status, req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        let idCoach = decoded._id;
        console.log("idCoach : " + idCoach);
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
}

exports.findMatchFinished = function(req, res) {
    findMatch('finished', req, res);
}

exports.findMatchComeUp = function(req, res) {
    findMatch('comeup', req, res);
}
