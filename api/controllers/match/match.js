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
let Football = require('../../sports/football/football');
let privateMatch = require('./private');
let _ = require('underscore');


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
            let msg = "Certains champs n'ont pas été saisies";
            return Utils.error(res, msg);
        }
        // TODO: add red and yellow card
        let newMatch = new Match({
            team: decoded.team.name_club.toUpperCase(),
            against_team: against_team.toUpperCase(),
            place,
            type,
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
                totalDefensiveAction: 0,
                totalPassesCompletion: 0,
                totalRelanceCompletion: 0,
                totalRedCard: 0,
                totalYellowCard: 0,
                totalPassesFailed: 0,
                but_opponent: 0
            }
        });

        Coach.findById(idCoach, (err, coach) => {
            if (err) {
                return Utils.errorIntern(res, err);
            }


            real_time.addStatisticsMatch(newMatch._id.toString(), idCoach, newMatch);

            newMatch.save((err) => {
                if (err) {
                    return Utils.errorIntern(res, err);
                }
            });

            coach.team.matchs.push(newMatch);
            let nameClub = coach.team.name_club;

            coach.save((err, coach) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });
            let returnMsg = (place === `Domicile`) ? `Le match ${nameClub} - ${against_team} a été ajouté` :
                `Le match ${against_team} - ${nameClub} a été ajouté`;

            res.status(201).json({
                success: true,
                msg: returnMsg,
                match: coach.team.matchs
            });
        });
    } else {
        return res.status(403).json({
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
                return Utils.errorIntern(res, err);

            res.status(200).json({
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
                return Utils.errorIntern(res, err);

            let match = coach.team.matchs.id(req.params.id);
            res.status(200).json({
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
                return Utils.errorIntern(res, err);

            // Match.remove({
            //     _id: idMatch
            // }, (err) => {
            //     if (err)
            //         return Utils.errorIntern(res, err);
            // });
            let match = coach.team.matchs.id(idMatch);
            let against_team = match.against_team;
            let nameClub = coach.team.name_club;
            match.remove((err, match) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });

            coach.save((err, coach) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });
            let returnMsg = (match.place === `Domicile`) ? `Le match ${nameClub} - ${against_team} a été supprimé` :
                `Le match ${against_team} - ${nameClub} a été supprimé`;
            res.status(200).json({
                success: true,
                msg: returnMsg,
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
                return Utils.errorIntern(res, err);

            Match.findById(idMatch, (err, foundMatch) => {

                if (err)
                    return Utils.errorIntern(res, err);
                let match = coach.team.matchs.id(idMatch);

                match.formation = formation;
                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);
                });

                foundMatch.formation = formation;
                foundMatch.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);
                });
                console.log(match);

                res.status(200).json({
                    success: true,
                    match: match
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

//obtenir la tactique d'un match
exports.getTactique = function(req, res) {

    let token = getToken(req.headers);
    let tactique = req.query.tactique;
    if (token) {

        if (tactique === '4-4-2') {
            return res.status(200).json({
                success: true,
                tactique: Football.QQDEUX_POST
            });
        } else if (tactique === '4-3-3') {
            return res.status(200).json({
                success: true,
                tactique: Football.QTTROIS_POST
            });
        } else {
            return res.status(400).json({
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

// //supprimer un joueur sélectionné
// exports.removePlayerSelected = function(req, res) {
//     let token = getToken(req.headers);
//
//     if (token) {
//         let decoded = jwt.decode(token, config.secret);
//         let player_id = req.body.player_id;
//         let match_id = req.body.match_id;
//
//         Player.findById(player_id, function(err, player) {
//             if (err)
//                 res.status(404).json({
//                     error: err
//                 });
//
//             Coach.findById(decoded._id, function(err, coach) {
//                 if (err) {
//                     res.status(404).json({
//                         error: err
//                     });
//                 }
//
//                 let playersSelected = coach.team.matchs
//                     .id(match_id)
//                     .playerSelected;
//
//                 let findPlayer = playersSelected.indexOf(player_id);
//
//                 if (findPlayer >= 0) {
//                     real_time.removePlayerSelected_firebase(player, match_id, decoded._id);
//                     playersSelected.splice(findPlayer, 1);
//
//                 } else {
//                     return res.status(202).json({
//                         msg: 'player not exists'
//                     });
//                 }
//
//                 coach.save(function(err) {
//                     if (err)
//                         res.status(404).json({
//                             error: err
//                         });
//                     res.status(202).json({
//                         player: player,
//                         playerSelected: playersSelected,
//                         msg: 'player removed'
//                     });
//                 });
//
//             });
//         });
//     } else {
//         return res.status(403).send({
//             success: false,
//             msg: 'No token provided.'
//         });
//     }
// };
//
// exports.addPlayerSelected = function(req, res) {
//
//     let token = getToken(req.headers);
//
//     if (token) {
//         let decoded = jwt.decode(token, config.secret);
//         let player_id = req.body.player_id;
//         let match_id = req.body.match_id;
//         let position = req.body.position;
//
//
//         async.waterfall([
//             (cb) => {
//
//                 Coach.findById(decoded._id, (err, coach) => {
//                     if (err)
//                         throw err;
//
//                     let playerSelected = coach.team.matchs.id(match_id).playerSelected;
//                     let formation = coach.team.matchs.id(match_id).formation;
//                     let findPlayer = playerSelected.indexOf(player_id); // return -1 if player not exist else return value >= 0
//                     let numberPlayerSelected = playerSelected.length;
//
//                     cb(null, playerSelected, formation, findPlayer, numberPlayerSelected, coach);
//
//                 });
//             },
//
//             (playerSelected, formation, findPlayer, numberPlayerSelected, coach, cb) => {
//
//                 Player.find({
//                     _id: {
//                         "$in": playerSelected
//                     }
//                 }, (err, playerPosition) => {
//                     console.log(playerPosition);
//                     Player.findById(player_id, (err, mainPlayer) => {
//
//                         for (let player of playerPosition) {
//
//                             // check if there are 11 players on the pitch
//                             if ((numberPlayerSelected >= 11) && (findPlayer < 0) && (position !== 'REM')) {
//                                 return res.status(201).json({
//                                     success: false,
//                                     msg: 'Vous avez dejà 11 joueurs sur le terrain'
//                                 });
//                             }
//                             // check if two players are the same position
//                             if (player.position === position && position !== 'REM' && player._id.toString() !== player_id.toString()) {
//                                 return res.status(201).json({
//                                     success: false,
//                                     msg: `Attention
//                                     ${player.first_name} ${player.last_name} et ${mainPlayer.first_name} ${mainPlayer.last_name}
//                                     ne peuvent pas avoir le même poste`
//                                 });
//                             }
//                         }
//                         cb(null, playerSelected, formation, findPlayer, numberPlayerSelected, coach);
//                     });
//                 });
//             },
//
//             (playerSelected, formation, findPlayer, numberPlayerSelected, coach, cb) => {
//
//                 Player.findById(player_id, (err, player) => {
//                     if (err)
//                         throw err;
//
//                     //change position of player even if he is already added
//                     player.position = position;
//
//                     real_time.updateStatistic_firebase(player, match_id, decoded._id, {
//                         first_name: player.first_name,
//                         last_name: player.last_name,
//                         id: player._id,
//                         position: position,
//                     });
//
//                     //check if user already exist
//                     if (findPlayer === -1) {
//
//                         // if array stat is empty add stat
//                         if (player.statistics.length === 0) {
//                             //add stastistic to player
//                             privateMatch.addStatisticsToPlayer(player, match_id);
//
//                         } else {
//
//                             // if array stat is not empty check if stat with
//                             // match_id already exist
//                             let statExist = false;
//                             for (let i = 0, x = player.statistics.length; i < x; i++) {
//                                 if (player.statistics[i].match_id.toString() === match_id.toString()) {
//                                     statExist = true;
//                                 }
//                             }
//
//                             if (!statExist) {
//                                 //add stastistic to player
//                                 privateMatch.addStatisticsToPlayer(player, match_id);
//                             }
//                         }
//
//                         if (formation === '4-4-2') {
//
//                             real_time.addPlayer_firebase(player, match_id, decoded._id, true);
//                             playerSelected.push(player);
//
//                             player.save();
//                             coach.save();
//                             console.log(player);
//                             return res.status(201).json({
//                                 success: true,
//                                 player: player,
//                                 playersSelected: playerSelected,
//                                 msg: 'Joueur ajouté'
//                             });
//                         }
//                     } else {
//                         player.save();
//                         return res.status(201).json({
//                             success: false,
//                             msg: 'Ce joueur a déjà été ajouté',
//                             playersSelected: playerSelected
//                         });
//                     }
//                 });
//             }
//         ]);
//     } else {
//         res.status(403).send({
//             success: false,
//             msg: 'No token provided.'
//         });
//     }
// };

//get player selected
exports.getPlayerSelected = function(req, res) {

    let token = getToken(req.headers);

    if (token) {

        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id)
            .populate('team.matchs.playerSelected')
            .exec(function(err, coach) {
                if (err)
                    return Utils.errorIntern(res, err);

                let playerSelected = coach.team.matchs.id(req.query.match_id).playerSelected;

                res.status(200).json({
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
    let GD_QQD = false,
        DFD_QQD = false,
        DFG_QQD = false,
        ARG_QQD = false,
        ARD_QQD = false,
        MCD_QQD = false,
        MCG_QQD = false,
        MD_QQD = false,
        MG_QQD = false,
        ATG_QQD = false,
        ATD_QQD = false;

    let GD_QTT = false,
        DFD_QTT = false,
        DFG_QTT = false,
        ARG_QTT = false,
        ARD_QTT = false,
        MC_QTT = false,
        MCG_QTT = false,
        MCD_QTT = false,
        ATG_QTT = false,
        ATD_QTT = false,
        AV_QTT = false;

    let GD_TCD = false,
        DC_TCD = false,
        DCG_TCD = false,
        DCD_TCD = false,
        ARG_TCD = false,
        ARD_TCD = false,
        MC_TCD = false,
        MCG_TCD = false,
        MCD_TCD = false,
        ATG_TCD = false,
        ATD_TCD = false;

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        let idCoach = decoded._id;

        async.waterfall([
            (done) => {
                Coach.findById(idCoach, (err, coach) => {
                    if (err)
                        return Utils.errorIntern(res, err);

                    let team = coach.team;
                    let match = team.matchs.id(idMatch);
                    let players = team.players;

                    if (match.playerSelected.length !== 0) {
                        //  console.log('playerSelected');
                        match.playerSelected = [];

                        real_time.resetPlayersSelected_firebase(idMatch, idCoach);
                    }
                    if (match.playerNoSelected.length !== 0) {
                        //console.log('playerNoSelected');
                        match.playerNoSelected = [];
                        real_time.resetPlayersNoSelected_firebase(idMatch, idCoach);
                    }
                    let playersSelected = match.playerSelected;
                    let playersNoSelected = match.playerNoSelected;
                    //coach.save();
                    done(null, match, players, playersSelected, playersNoSelected, coach);
                });
            },

            (match, players, playersSelected, playersNoSelected, coach, done) => {
                Match.findById(idMatch, (err, foundMatch) => {

                    if (foundMatch.playerSelected.length !== 0) {
                        foundMatch.playerSelected = [];
                    }

                    if (foundMatch.playerNoSelected.length !== 0) {
                        foundMatch.playerNoSelected = [];
                    }

                    done(null, match, players, playersSelected, playersNoSelected, foundMatch, coach);
                });
            },

            (match, players, playersSelected, playersNoSelected, foundMatch, coach, done) => {
                //Reset position player before choose new one
                console.log('rrr', playersSelected, playersNoSelected);
                Player.find({
                    _id: {
                        "$in": players
                    }
                }, (err, playersTeam) => {

                    for (let player of playersTeam) {
                        privateMatch._resetPosition(idMatch, idCoach, player._id.toString());
                    }

                    done(null, match, players, playersSelected, playersNoSelected, foundMatch, coach);
                });
            },

            (match, players, playersSelected, playersNoSelected, foundMatch, coach, done) => {
                let maxPlayer = 0;
                let maxSubstitute = 0;
                let countGD = 0;
                Player.find({
                        _id: {
                            "$in": players
                        }
                    },
                    (err, playersTeam) => {
                        if (err)
                            return Utils.errorIntern(res, err);

                        //pour que defaultPosition ne soit executer que une seul fois
                        if (match.defaultPosition !== true) {

                            if (coach.sport === Football.FOOTBALL) {

                                if (match.formation === Football.QQDEUX) {

                                    for (let player of playersTeam) {


                                        // placement du gardien
                                        if (player.favourite_position === Football.GD && GD_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'GD', idCoach, playersSelected, foundMatch);
                                            console.log('defaultPosition_____', playersSelected);
                                            GD_QQD = true;
                                            maxPlayer++;
                                            continue;

                                        }

                                        if (player.favourite_position === Football.DEF && DFG_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'DFG', idCoach, playersSelected, foundMatch);
                                            console.log('defaultPosition_____', playersSelected);
                                            DFG_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.DEF && DFD_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'DFD', idCoach, playersSelected, foundMatch);
                                            console.log('defaultPosition_____', playersSelected);
                                            DFD_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AR && ARG_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ARG', idCoach, playersSelected, foundMatch);
                                            ARG_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AR && ARD_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ARD', idCoach, playersSelected, foundMatch);
                                            ARD_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.MD && MCD_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MCD', idCoach, playersSelected, foundMatch);
                                            MCD_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.MD && MCG_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MCG', idCoach, playersSelected, foundMatch);
                                            MCG_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if ((player.favourite_position === Football.MO || player.favourite_position === Football.AI) && MD_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MD', idCoach, playersSelected, foundMatch);
                                            MD_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if ((player.favourite_position === Football.MO || player.favourite_position === Football.AI) && MG_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MG', idCoach, playersSelected, foundMatch);
                                            MG_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AV && ATG_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ATG', idCoach, playersSelected, foundMatch);
                                            ATG_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AV && ATD_QQD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ATD', idCoach, playersSelected, foundMatch);
                                            ATD_QQD = true;
                                            maxPlayer++;
                                            continue;
                                        }


                                        if (maxSubstitute < Football.NUMBER_SUBSTITUTE) {
                                            privateMatch._defaultPosition(player, idMatch, 'REM', idCoach, playersSelected, foundMatch);
                                            maxSubstitute++;
                                            continue;
                                        }
                                    } //for

                                } //if QQDEUX

                                if (match.formation === Football.QTTROIS) {
                                    console.log('4-4-3');
                                    for (let player of playersTeam) {

                                        // placement du gardien
                                        if (player.favourite_position === Football.GD && GD_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'GD', idCoach, playersSelected, foundMatch);
                                            GD_QTT = true;
                                            maxPlayer++;
                                            continue;

                                        }

                                        if (player.favourite_position === Football.DEF && DFG_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'DFG', idCoach, playersSelected, foundMatch);
                                            DFG_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.DEF && DFD_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'DFD', idCoach, playersSelected, foundMatch);
                                            DFD_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AR && ARG_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ARG', idCoach, playersSelected, foundMatch);
                                            ARG_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AR && ARD_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ARD', idCoach, playersSelected, foundMatch);
                                            ARD_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.MD && MC_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MC', idCoach, playersSelected, foundMatch);
                                            MC_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.MD && MCG_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MCG', idCoach, playersSelected, foundMatch);
                                            MCG_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if ((player.favourite_position === Football.MO || player.favourite_position === Football.AI) && MCD_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MCD', idCoach, playersSelected, foundMatch);
                                            MCD_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if ((player.favourite_position === Football.MO || player.favourite_position === Football.AI) && ATG_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ATG', idCoach, playersSelected, foundMatch);
                                            ATG_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AV && ATD_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ATD', idCoach, playersSelected, foundMatch);
                                            ATD_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AV && AV_QTT === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'AV', idCoach, playersSelected, foundMatch);
                                            AV_QTT = true;
                                            maxPlayer++;
                                            continue;
                                        }


                                        if (maxSubstitute < Football.NUMBER_SUBSTITUTE) {
                                            privateMatch._defaultPosition(player, idMatch, 'REM', idCoach, playersSelected, foundMatch);
                                            maxSubstitute++;
                                            continue;
                                        }
                                    } //for

                                } //if QQTTROIS

                                //TCDEUX
                                if (match.formation === Football.TCDEUX) {
                                    for (let player of playersTeam) {
                                        // placement du gardien
                                        if (player.favourite_position === Football.GD && GD_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'GD', idCoach, playersSelected, foundMatch);
                                            GD_TCD = true;
                                            maxPlayer++;
                                            continue;

                                        }

                                        if (player.favourite_position === Football.DEF && DC_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'DC', idCoach, playersSelected, foundMatch);
                                            DC_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.DEF && DCG_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'DCG', idCoach, playersSelected, foundMatch);
                                            DCG_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.DEF && DCD_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'DCD', idCoach, playersSelected, foundMatch);
                                            DCD_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AR && ARG_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ARG', idCoach, playersSelected, foundMatch);
                                            ARG_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AR && ARD_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ARD', idCoach, playersSelected, foundMatch);
                                            ARD_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.MD && MC_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MC', idCoach, playersSelected, foundMatch);
                                            MC_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.MD && MCG_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MCG', idCoach, playersSelected, foundMatch);
                                            MCG_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if ((player.favourite_position === Football.MO || player.favourite_position === Football.AI) && MCD_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'MCD', idCoach, playersSelected, foundMatch);
                                            MCD_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AV && ATG_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ATG', idCoach, playersSelected, foundMatch);
                                            ATG_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (player.favourite_position === Football.AV && ATD_TCD === false) {
                                            privateMatch._defaultPosition(player, idMatch, 'ATD', idCoach, playersSelected, foundMatch);
                                            ATD_TCD = true;
                                            maxPlayer++;
                                            continue;
                                        }

                                        if (maxSubstitute < Football.NUMBER_SUBSTITUTE) {
                                            privateMatch._defaultPosition(player, idMatch, 'REM', idCoach, playersSelected, foundMatch);
                                            maxSubstitute++;
                                            continue;
                                        }
                                    } //for

                                } //if TCDEUX
                            } //if Football
                        } //defaultPosition
                        //match.defaultPosition = true;
                        console.log('formation', playersSelected);
                        done(null, match, players, playersSelected, playersNoSelected, foundMatch, coach);

                    });
            },

            (match, players, playersSelected, playersNoSelected, foundMatch, coach) => {

                //diff between playersSelected and players of troop
                console.log('rfrfr', players, match.playerSelected);
                let diffPlayersNoSelected = Utils.diffArray(players, playersSelected);
                //console.log(diffPlayersNoSelected);
                //console.log(diffPlayersNoSelected.map((elt) => elt.toString()), match.playerSelected);

                //  console.log(playersNoSelected, match.playerNoSelected);
                Player.find({
                    _id: {
                        "$in": diffPlayersNoSelected
                    }
                }, (err, playersFound) => {
                    console.log(playersFound.length);

                    if (err)
                        return Utils.errorIntern(res, err);

                    for (let player of playersFound) {
                        // TODO: et foundMatch.playerNoSelected indexOf
                        if (match.playerNoSelected.indexOf(player._id) === -1) {
                            console.log(player.last_name);
                            player.position = 'no_selected';
                            privateMatch.addStatisticsToPlayer(player, idMatch);
                            match.playerNoSelected.push(player);
                            foundMatch.playerNoSelected.push(player);
                            player.save((err) => {
                                if (err)
                                    return Utils.errorIntern(res, err);
                            });
                        }


                        real_time.addPlayer_firebase(player, idMatch, idCoach, false);
                    }

                    foundMatch.save();

                    coach.save((err) => {
                        if (err)
                            return Utils.errorIntern(res, err);
                    });

                    //console.log(playersFound.length, playersSelected.length, playersNoSelected.length);
                    return res.status(200).json({
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
// TODO: A faire pour les matchs entité seule
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
                        return Utils.errorIntern(res, err);
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
                Match.findById(match_id, (err, foundMatch) => {

                    let foundMatchPlayerSelected = foundMatch.playerSelected;
                    let foundMatchPlayerNoSelected = foundMatch.playerNoSelected;

                    cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, foundMatchPlayerSelected, foundMatchPlayerNoSelected, foundMatch);

                });
            },

            (playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, foundMatchPlayerSelected, foundMatchPlayerNoSelected, foundMatch, cb) => {

                //si joueur 1 est dans les joueurs selectionnés et joueur 2 dans les joueurs non sélectionnés
                if (fstPlayerSelectedExists >= 0 && sndPlayerNoSelectedExists >= 0) {

                    Player.findById(player_id_one, (fstErr, fstPlayer) => {
                        if (fstErr) {
                            return Utils.errorIntern(res, fstErr);
                        }
                        Player.findById(player_id_two, (sndErr, sndPlayer) => {
                            if (sndErr) {
                                return Utils.errorIntern(res, sndErr);
                            }

                            playersNoSelected.push(fstPlayer);
                            playersSelected.splice(fstPlayerSelectedExists, 1);
                            foundMatchPlayerNoSelected.push(fstPlayer);
                            foundMatchPlayerSelected.splice(fstPlayerSelectedExists, 1);

                            playersSelected.push(sndPlayer);
                            playersNoSelected.splice(sndPlayerNoSelectedExists, 1);
                            foundMatchPlayerSelected.push(sndPlayer);
                            foundMatchPlayerNoSelected.splice(sndPlayerNoSelectedExists, 1);

                            cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, foundMatchPlayerSelected, foundMatchPlayerNoSelected, foundMatch);

                        });
                    });
                } else {
                    cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, foundMatchPlayerSelected, foundMatchPlayerNoSelected, foundMatch);
                }

            },

            (playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, foundMatchPlayerSelected, foundMatchPlayerNoSelected, foundMatch, cb) => {

                //si joueur 2 est dans les joueurs selectionnés et joueur 1 dans les joueurs non sélectionnés
                if (fstPlayerNoSelectedExists >= 0 && sndPlayerSelectedExists >= 0) {

                    Player.findById(player_id_two, (sndErr, sndPlayer) => {
                        if (sndErr) {
                            return Utils.errorIntern(res, sndErr);
                        }
                        Player.findById(player_id_one, (fstErr, fstPlayer) => {
                            if (fstErr) {
                                return Utils.errorIntern(res, fstErr);
                            }

                            playersNoSelected.push(sndPlayer);
                            playersSelected.splice(sndPlayerSelectedExists, 1);
                            foundMatchPlayerNoSelected.push(sndPlayer);
                            foundMatchPlayerSelected.splice(sndPlayerSelectedExists, 1);

                            playersSelected.push(fstPlayer);
                            playersNoSelected.splice(fstPlayerNoSelectedExists, 1);
                            foundMatchPlayerSelected.push(fstPlayer);
                            foundMatchPlayerNoSelected.splice(fstPlayerNoSelectedExists, 1);

                            cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, foundMatchPlayerSelected, foundMatchPlayerNoSelected, foundMatch);
                        });
                    });
                } else {
                    cb(null, playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, foundMatchPlayerSelected, foundMatchPlayerNoSelected, foundMatch);
                }
            },

            (playersSelected, playersNoSelected, coach, fstPlayerSelectedExists, sndPlayerSelectedExists, fstPlayerNoSelectedExists, sndPlayerNoSelectedExists, foundMatchPlayerSelected, foundMatchPlayerNoSelected, foundMatch, cb) => {

                foundMatch.save();
                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);
                });
                //si les deux joueurs son selectionnés
                if (fstPlayerSelectedExists >= 0 && sndPlayerSelectedExists >= 0) {

                    Player.findById(player_id_one, (fstErr, fstPlayer) => {
                        if (fstErr)
                            return Utils.errorIntern(res, fstErr);

                        Player.findById(player_id_two, (sndErr, sndPlayer) => {
                            if (sndErr)
                                return Utils.errorIntern(res, sndErr);

                            //  console.log(sndPlayer);
                            let sndPosition = sndPlayer.position;
                            let fstPosition = fstPlayer.position;

                            fstPlayer.position = sndPosition;

                            fstPlayer.save((err) => {
                                if (err)
                                    return Utils.errorIntern(res, err);
                            });

                            sndPlayer.position = fstPosition;
                            sndPlayer.save((err) => {
                                if (err)
                                    return Utils.errorIntern(res, err);
                            });

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
                        return Utils.errorIntern(res, sndErr);
                    }

                    Player.findById(player_id_one, (fstErr, fstPlayer) => {
                        console.log(fstPlayer);
                        if (fstErr) {
                            return Utils.errorIntern(res, fstErr);
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
    let time = req.body.time;
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;

        Coach.findById(coach_id, (err, coach) => {
            if (err)
                return Utils.errorIntern(res, err);

            Match.findById(match_id, (errMatch, foundMatch) => {
                if (errMatch)
                    return Utils.errorIntern(res, errMatch);

                let actionButOpponent = ['But Adverse', 'but_opponent', time];


                foundMatch.statistics.but_opponent++;
                foundMatch.schemas = [];
                foundMatch.schemaMatch.push(actionButOpponent);
                foundMatch.actions.push(actionButOpponent);
                foundMatch.save();

                let match = coach.team.matchs.id(match_id);
                let statistics = match.statistics;
                statistics.but_opponent++;
                match.schemas = [];
                match.schemaMatch.push(actionButOpponent);
                match.actions.push(actionButOpponent);
                real_time.addActions(match_id, coach_id, actionButOpponent);
                console.log(match_id);
                console.log(statistics);


                real_time.updateStatMatch_firebase(coach_id, match_id, {
                    but_opponent: statistics.but_opponent
                });

                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);
                });

                res.status(201).json({
                    success: true,
                    but_opponent: statistics.but_opponent
                });
            });

        });
    } else {
        return res.status(403).json({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports.setResultMatch = (req, res) => {
    let match_id = req.body.match_id;
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;

        Coach.findById(coach_id, (err, coach) => {
            if (err)
                return Utils.errorIntern(res, err);

            console.log(match_id);

            Match.findById(match_id, (matchErr, match) => {
                if (matchErr)
                    return Utils.errorIntern(res, matchErr);

                let matchCoach = coach.team.matchs.id(match_id);
                let statMatch = matchCoach.statistics;
                let result = '';

                console.log(statMatch.totalBut, statMatch.but_opponent);
                if (statMatch.totalBut === statMatch.but_opponent) {
                    result = 'draw';
                }
                if (statMatch.totalBut > statMatch.but_opponent) {
                    result = 'victory';
                }

                if (statMatch.totalBut < statMatch.but_opponent) {
                    result = 'defeat';
                }

                console.log(result);
                match.result = result;
                match.save();

                matchCoach.result = result;
                coach.save();

                res.status(200).json({
                    success: true,
                    result
                });

            });
        });


    } else {
        return res.status(403).json({
            success: false,
            msg: 'No token provided.'
        });
    }


}

exports.putMatchFinished = (req, res) => {

    let match_id = req.body.match_id;
    let token = getToken(req.headers);

    if (token) {

        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;

        Coach.findById(coach_id, (coachErr, coach) => {
            if (coachErr)
                return Utils.errorIntern(res, coachErr);

            Match.findById(match_id, (matchErr, match) => {

                if (matchErr)
                    return Utils.errorIntern(res, matchErr);

                let matchCoach = coach.team.matchs.id(match_id);
                console.log(matchCoach);
                matchCoach.status = "finished";
                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);
                });

                match.status = 'finished';
                match.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);
                });

                real_time.removeMatch_firebase(coach_id, match_id);

                res.status(202).json({
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

exports.getGlobalStatisticsMatch = (req, res) => {
    let token = getToken(req.headers);

    let statisticsGlobal = {
        "totalBallPlayed": 0,
        "totalBallLost": 0,
        "totalRetrieveBalls": 0,
        "totalFoulsSuffered": 0,
        "totalFoulsCommited": 0,
        "totalOffSide": 0,
        "totalAttempts": 0,
        "totalAttemptsOnTarget": 0,
        "totalAttemptsOffTarget": 0,
        "totalBut": 0,
        "totalPassesCompletion": 0,
        "totalRelanceCompletion": 0,
        "totalRedCard": 0,
        "totalDefensiveAction": 0,
        "totalYellowCard": 0,
        "totalPassesFailed": 0,
        "but_opponent": 0
    };

    let keyStatisticsGlobal = Object.keys(statisticsGlobal);

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;
        let nbrMatchFinished = 0;

        Coach.findById(coach_id, (err, coach) => {

            if (err)
                return Utils.errorIntern(res, err);

            let matchs = coach.team.matchs

            for (let match of matchs) {
                if (match.status === 'finished') {
                    nbrMatchFinished++;
                    let statistics = match.statistics

                    for (let key of keyStatisticsGlobal) {
                        statisticsGlobal[key] += statistics[key];
                    }
                }
            }

            statisticsGlobal.totalPassesCompletion = statisticsGlobal.totalPassesCompletion / nbrMatchFinished;
            statisticsGlobal.totalRelanceCompletion = statisticsGlobal.totalRelanceCompletion / nbrMatchFinished;

            res.status(200).json({
                success: true,
                statisticsGlobal,
                nbrMatchFinished
            });
        });
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};
