//controller match
'use strict';

let getToken = require('../token');
let Utils = require('../../utils');
let jwt = require('jwt-simple');
let config = require('../../config/database');
let Match = require('../../models/match').modelMatch;
let Coach = require('../../models/coach').modelCoach;
let Player = require('../../models/player').modelPlayer;
let Statistic = require('../../models/statistics').modelStatistic;
let real_time = require('../../real_time');
let async = require('async');
let Football = require('../../sports/football');
let privateMatch = require('./private');


//add new match
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
        // TODO: add red and yellow card
        let newMatch = new Match({
            against_team: against_team,
            place: place,
            type: type,
            date: new Date(date),
            belongs_to: idCoach,
            defaultPosition: false,
            status: 'comeup',
            statistics: {
                totalBallPlayed: 0,
                totalBallLost: 0,
                totalRetrieveBalls: 0,
                totalFoulsSuffered: 0,
                totalFoulsCommited: 0,
                totalOffSide: 0,
                totalAttempts: 0,
                totalAttemptsOnTarget: 0,
                totalAttemptsOffTarget: 0,
                totalBut: 0,
                totalPassesCompletion: 0,
                totalRelanceCompletion: Number,
                but_opponent: Number
            }

        });


        console.log(newMatch);

        Coach.findById(idCoach, function(err, coach) {
            if (err)
                throw err;

            real_time.addStatisticsMatch(newMatch._id.toString(), idCoach, newMatch);
            newMatch.save(function(err, match) {
                if (err) {
                    throw err;
                }
            });
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

//get all match d'un coach
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

//get match d'un coach by id
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
};

//remove le match d'un coach
exports.removeMatch = function(req, res) {

    let token = getToken(req.headers);
    let idMatch = req.body.id;

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                throw err;

            Match.remove({
                _id: idMatch
            }, function(err, ok) {
                console.log(err, ok);
            });

            coach.team.matchs.id(idMatch).remove();
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

//choisir une formation pour un match
exports.addFormation = function(req, res) {

    let token = getToken(req.headers);
    let idMatch = req.body.id;
    let formation = req.body.formation;

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                throw err;

            let match = coach.team.matchs.id(idMatch);

            match.formation = formation;
            coach.save();
            console.log(match);

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

//obtenir la tactique d'un match
exports.getTactique = function(req, res) {

    let token = getToken(req.headers);
    let tactique = req.query.tactique;
    if (token) {

        if (tactique === '4-4-2') {
            res.json({
                success: true,
                tactique: Football.QQDEUX_POST
            });
        } else if (tactique === '4-3-3') {
            res.json({
                success: true,
                tactique: Football.QTTROIS_POST
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

//supprimer un joueur sélectionné
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
                    console.log(playerPosition);
                    Player.findById(player_id, (err, mainPlayer) => {

                        for (let player of playerPosition) {

                            // check if there are 11 players on the pitch
                            if ((numberPlayerSelected >= 11) && (findPlayer < 0) && (position !== 'REM')) {
                                return res.status(201).json({
                                    success: false,
                                    msg: 'Vous avez dejà 11 joueurs sur le terrain'
                                });
                            }
                            // check if two players are the same position
                            if (player.position === position && position !== 'REM' && player._id.toString() !== player_id.toString()) {
                                return res.status(201).json({
                                    success: false,
                                    msg: `Attention
                                    ${player.first_name} ${player.last_name} et ${mainPlayer.first_name} ${mainPlayer.last_name}
                                    ne peuvent pas avoir le même poste`
                                });
                            }
                        }
                        cb(null, playerSelected, formation, findPlayer, numberPlayerSelected, coach);
                    });
                });
            },

            (playerSelected, formation, findPlayer, numberPlayerSelected, coach, cb) => {

                Player.findById(player_id, (err, player) => {
                    if (err)
                        throw err;

                    //change position of player even if he is already added
                    player.position = position;

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
                            privateMatch.addStatisticsToPlayer(player, match_id);

                        } else {

                            // if array stat is not empty check if stat with
                            // match_id already exist
                            let statExist = false;
                            for (let i = 0, x = player.statistics.length; i < x; i++) {
                                if (player.statistics[i].match_id.toString() === match_id.toString()) {
                                    statExist = true;
                                }
                            }

                            if (!statExist) {
                                //add stastistic to player
                                privateMatch.addStatisticsToPlayer(player, match_id);
                            }
                        }

                        if (formation === '4-4-2') {

                            real_time.addPlayer_firebase(player, match_id, decoded._id, true);
                            playerSelected.push(player);

                            player.save();
                            coach.save();
                            console.log(player);
                            return res.status(201).json({
                                success: true,
                                player: player,
                                playersSelected: playerSelected,
                                msg: 'Joueur ajouté'
                            });
                        }
                    } else {
                        player.save();
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

//get player selected
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

//return les matchs fini
exports.findMatchFinished = function(req, res) {
    privateMatch._findMatch('finished', req, res);
};

//return les match en cours
exports.findMatchComeUp = function(req, res) {
    privateMatch._findMatch('comeup', req, res);
};


//ajoute une selection de 11 joueurs par défault
//en fonction de leurs position favorite
//la fonction fait également la différence entre les joueurs séléctionné et les joueurs de l'effectif
//pour trouvé les joueurs non sélectionnés

exports.defaultPosition = (req, res) => {
    let token = getToken(req.headers);

    let idMatch = req.body.match_id;
    let countGD = 0;
    let GD = false,
        DFD = false,
        DFG = false,
        ARG = false,
        ARD = false,
        MCD = false,
        MCG = false,
        MD = false,
        MG = false,
        ATG = false,
        ATD = false;

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        let idCoach = decoded._id;

        async.waterfall([
            (done) => {
                Coach.findById(idCoach, (err, coach) => {
                    if (err)
                        throw err;

                    let team = coach.team;
                    let match = team.matchs.id(idMatch);
                    let players = team.players;
                    let playersSelected = match.playerSelected;
                    done(null, match, players, playersSelected, coach);
                });
            },

            (match, players, playersSelected, coach, done) => {
                let maxPlayer = 0;
                let countGD = 0;
                Player.find({
                        _id: {
                            "$in": players
                        }
                    },
                    (err, playersTeam) => {

                        //pour que defaultPosition ne soit executer que une seul fois
                        if (match.defaultPosition !== true) {

                            if (coach.sport === Football.FOOTBALL) {

                                if (match.formation === Football.QQDEUX) {

                                    while (maxPlayer < 11) {

                                        for (let player of playersTeam) {

                                            // placement du gardien
                                            if (player.favourite_position === Football.GD && GD === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'GD', idCoach, playersSelected);
                                                GD = true;
                                                maxPlayer++;
                                                continue;

                                            }

                                            if (player.favourite_position === Football.DEF && DFG === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'DFG', idCoach, playersSelected);
                                                DFG = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if (player.favourite_position === Football.DEF && DFD === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'DFD', idCoach, playersSelected);
                                                DFD = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if (player.favourite_position === Football.AR && ARG === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'ARG', idCoach, playersSelected);
                                                ARG = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if (player.favourite_position === Football.AR && ARD === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'ARD', idCoach, playersSelected);
                                                ARD = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if (player.favourite_position === Football.MD && MCD === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'MCD', idCoach, playersSelected);
                                                MCD = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if (player.favourite_position === Football.MD && MCG === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'MCG', idCoach, playersSelected);
                                                MCG = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if ((player.favourite_position === Football.MO || player.favourite_position === Football.AI) && MD === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'MD', idCoach, playersSelected);
                                                MD = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if ((player.favourite_position === Football.MO || player.favourite_position === Football.AI) && MG === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'MG', idCoach, playersSelected);
                                                MG = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if (player.favourite_position === Football.AV && ATG === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'ATG', idCoach, playersSelected);
                                                ATG = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if (player.favourite_position === Football.AV && ATD === false) {
                                                privateMatch._defaultPosition(player, idMatch, 'ATD', idCoach, playersSelected);
                                                ATD = true;
                                                maxPlayer++;
                                                continue;
                                            }

                                            if (maxPlayer < 14) {
                                                privateMatch._defaultPosition(player, idMatch, 'REM', idCoach, playersSelected);
                                                maxPlayer++;
                                                continue;
                                            }
                                        } //for
                                    } //while
                                }
                            } //if
                        } //defaultPosition

                        match.defaultPosition = true;
                        done(null, match, players, playersSelected, coach);

                    });
            },

            (match, players, playersSelected, coach) => {
                //diff between playersSelected and players of troop
                let playersNoSelected = Utils.diffArray(players, playersSelected);

                console.log(players);
                Player.find({
                    _id: {
                        "$in": playersNoSelected
                    }
                }, (err, players) => {
                    let matchPlayerNoSelected = match.playerNoSelected;

                    if (err)
                        throw err;

                    for (let player of players) {

                        if (matchPlayerNoSelected.indexOf(player._id) === -1) {
                            privateMatch.addStatisticsToPlayer(player, idMatch);
                            matchPlayerNoSelected.push(player);
                            player.save();
                        }
                        real_time.addPlayer_firebase(player, idMatch, idCoach, false);
                    }

                    coach.save();

                    return res.status(202).json({
                        success: true,
                        players: match.playerNoSelected
                    });
                });

            }
        ]);
    } else {
        return res.status(403).json({
            success: false,
            msg: 'No token provided.'
        });
    }
};

//switch position entre 2 joueurs selectionnés.
//switch position entre un joueur selectioné et un non selectioné
exports.switchPosition = (req, res) => {

    let player_id_one = req.body.player_id_one;
    let player_id_two = req.body.player_id_two;
    let match_id = req.body.match_id;
    let token = getToken(req.headers);
    //  console.log(player_id_one, player_id_two);
    if (token) {
        let decoded = jwt.decode(token, config.secret);

        let idCoach = decoded._id;

        async.waterfall([

            (cb) => {
                Coach.findById(idCoach, (err, coach) => {

                    if (err) {
                        throw err;
                    }

                    let match = coach.team.matchs.id(match_id);
                    let playersSelected = match.playerSelected;
                    let playersNoSelected = match.playerNoSelected;

                    //présence du joueur 1 dans les joueurs sélectionnés
                    let fstPlayerSelectedExists = playersSelected.indexOf(player_id_one);
                    //présence du joueur 2 dans les joueurs sélectionnés
                    let sndPlayerSelectedExists = playersSelected.indexOf(player_id_two);
                    //présence du joueur 2 dans les joueurs non sélectionnés
                    let fstPlayerNoSelectedExists = playersNoSelected.indexOf(player_id_one);
                    //présence du joueur 2 dans les joueurs non sélectionnés
                    let sndPlayerNoSelectedExists = playersNoSelected.indexOf(player_id_two);

                    cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists);

                });
            },

            (playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, cb) => {

                //si joueur 1 est dans les joueurs selectionnés et joueur 2 dans les joueurs non sélectionnés
                if (fstPlayerSelectedExists >= 0 && sndPlayerNoSelectedExists >= 0) {

                    Player.findById(player_id_one, (fstErr, fstPlayer) => {
                        if (fstErr) {
                            throw fstErr;
                        }
                        Player.findById(player_id_two, (sndErr, sndPlayer) => {
                            if (sndErr) {
                                throw sndErr;
                            }

                            playersNoSelected.push(fstPlayer);
                            playersSelected.splice(fstPlayerSelectedExists, 1);

                            playersSelected.push(sndPlayer);
                            playersNoSelected.splice(sndPlayerNoSelectedExists, 1);

                            cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists);

                        });
                    });
                } else {
                    cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists);
                }

            },

            (playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, cb) => {

                //si joueur 2 est dans les joueurs selectionnés et joueur 1 dans les joueurs non sélectionnés
                if (fstPlayerNoSelectedExists >= 0 && sndPlayerSelectedExists >= 0) {

                    Player.findById(player_id_two, (sndErr, sndPlayer) => {
                        if (sndErr) {
                            throw sndErr;
                        }
                        Player.findById(player_id_one, (fstErr, fstPlayer) => {
                            if (fstErr) {
                                throw fstErr;
                            }

                            playersNoSelected.push(sndPlayer);
                            playersSelected.splice(sndPlayerSelectedExists, 1);

                            playersSelected.push(fstPlayer);
                            playersNoSelected.splice(fstPlayerNoSelectedExists, 1);

                            cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists);
                        });
                    });
                } else {
                    cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists);
                }
            },

            (playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, cb) => {

                coach.save();
                //si les deux joueurs son selectionnés
                if (fstPlayerSelectedExists >= 0 && sndPlayerSelectedExists >= 0) {

                    Player.findById(player_id_one, (fstErr, fstPlayer) => {
                        if (fstErr)
                            throw fstErr;

                        Player.findById(player_id_two, (sndErr, sndPlayer) => {
                            if (sndErr)
                                throw sndErr;

                            //  console.log(sndPlayer);
                            let sndPosition = sndPlayer.position;
                            let fstPosition = fstPlayer.position;

                            fstPlayer.position = sndPosition;
                            fstPlayer.save();

                            sndPlayer.position = fstPosition;
                            sndPlayer.save();

                            cb(null);

                        });
                    });
                } else {
                    cb(null);
                }

            },

            (cb) => {

                Player.findById(player_id_two, (sndErr, sndPlayer) => {

                    if (sndErr) {
                        throw sndErr;
                    }

                    Player.findById(player_id_one, (fstErr, fstPlayer) => {
                        console.log(fstPlayer);
                        if (fstErr) {
                            throw fstErr;
                        }

                        let fstPlayerName = `${fstPlayer.first_name} ${fstPlayer.last_name}`;
                        let sndPlayerName = `${sndPlayer.first_name} ${sndPlayer.last_name}`;

                        real_time.switchPosition_firebase(player_id_one, player_id_two, match_id, idCoach);

                        return res.status(200).json({
                            success: true,
                            msg: `${fstPlayerName} et ${sndPlayerName} ont changé de position`
                        });

                    });
                });
            }
        ]);

    } else {
        return res.status(403).json({
            success: false,
            msg: 'No token provided.'
        });
    }

};

exports.addOpponentBut = (req, res) => {

    let match_id = req.body.match_id;
    let token = getToken(req.headers);


    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;
        Coach.findById(coach_id, (err, coach) => {

            if (err)
                throw err;

            let match = coach.team.matchs.id(match_id);
            let statistics = match.statistics;
            statistics.but_opponent++;
            console.log(statistics);

            real_time.updateStatMatch_firebase(coach_id, match_id, {
                but_opponent: statistics.but_opponent
            });
            coach.save((err) => {
                if (err)
                    throw err;
            });
            res.status(202).json({
                success: true,
                but_opponent: statistics.but_opponent
            });
        });
    } else {
        return res.status(403).json({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports.putMatchFinished = (req, res) => {

    let match_id = req.body.match_id;
    let token = getToken(req.headers);


    if (token) {

        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;

        Coach.findById(coach_id, (err, coach) => {

            if (err)
                throw err;

            Match.findById(match_id, (err, match) => {
                let matchCoach = coach.team.matchs.id(match_id)
                matchCoach.status = "finished";
                coach.save();

                match.status = 'finished'
                match.save();

                res.status(200).json({
                    success: true,
                    match: match
                })
            });

        });
    } else {
        return res.status(403).json({
            success: false,
            msg: 'No token provided.'
        });
    }
};
