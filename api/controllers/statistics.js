    'use strict'

    let getToken = require('./token');
    let jwt = require('jwt-simple');
    let config = require('../config/database');
    let Player = require('../models/player').modelPlayer;
    let Match = require('../models/match').modelMatch;
    var Coach = require('../models/coach').modelCoach;
    let real_time = require('../real_time');


    // update statistics of player
    let updateStatPlayer = function(player, match_id, stat, err, coach_id) {
        //console.log(player);
        for (let i = 0, x = player.statistics.length; i < x; i++) {
            let statistics = player.statistics[i];

            //verify that is correct statistics
            if (statistics.match_id.toString() === match_id.toString()) {
                //  console.log(player);

                if (err)
                    throw err;
                statistics[stat]++;
                real_time.updateStatistic_firebase(player, match_id, coach_id, {
                    statistics: {
                        assist: statistics.assist,
                        retrieveBalls: statistics.retrieveBalls,
                        foulsSuffered: statistics.foulsSuffered,
                        foulsCommitted: statistics.foulsCommitted,
                        yellowCard: statistics.yellowCard,
                        redCard: statistics.redCard,
                        attemptsOnTarget: statistics.attemptsOnTarget,
                        attemptsOffTarget: statistics.attemptsOffTarget,
                        beforeAssist: statistics.beforeAssist,
                        matchPlayed: statistics.matchPlayed,
                        firstTeamPlayer: statistics.firstTeamPlayer,
                        substitute: statistics.substitute,
                        but: statistics.but,
                        ballLost: statistics.ballLost,
                        ballPlayed: statistics.ballPlayed,
                        passesCompletion: statistics.passesCompletion,
                        defensiveAction: statistics.defensiveAction,
                        relanceCompletion: statistics.relanceCompletion,
                        offSide: statistics.offSide,
                        passesFailed: statistics.passesFailed,
                        crossesFailed: statistics.crossesFailed,
                        saves: statistics.saves,
                        claquettes: statistics.claquettes,
                        sorties_aeriennes: statistics.sorties_aeriennes,
                        clean_sheet: statistics.clean_sheet
                    }
                });
                player.save();
            }
        }
    };

    // array of array of schema
    exports.addSchemaMatch = function(req, res) {
        let token = getToken(req.headers);

        let data = req.body.data;
        let match_id = req.body.match_id;

        if (token) {
            let decoded = jwt.decode(token, config.secret);
            Coach.findById(decoded._id, function(err, coach) {
                if (err)
                    throw err;

                let match = coach.team.matchs.id(match_id);
                match.schemaMatch.push(data);

                res.status(201).json({
                    success: true,
                    schemaMatch: match.schemaMatch
                });

            });

        } else {
            return res.status(403).send({
                success: false,
                msg: 'No token provided.'
            });
        }
    };

    //add player to schema schema
    exports.addPlayerSchema = function(req, res) {

        let token = getToken(req.headers);

        let data = req.body.data_schema;
        let match_id = req.body.match_id;

        if (token) {
            let decoded = jwt.decode(token, config.secret);

            Coach.findById(decoded._id, function(err, coach) {

                if (err)
                    throw err;

                let match = coach.team.matchs.id(match_id);
                match.schemas.push(data);

                coach.save();

                res.status(201).json({
                    success: true,
                    schemas: match.schemas
                });
            });
        } else {
            return res.status(403).send({
                success: false,
                msg: 'No token provided.'
            });
        }
    };

    exports.countMainAction = function(req, res) {

        let token = getToken(req.headers);
        let action = req.body.action;
        let match_id = req.body.match_id;

        if (token) {
            let decoded = jwt.decode(token, config.secret);
            let coach_id = decoded._id;

            Coach.findById(coach_id, function(err, coach) {
                if (err)
                    throw err;

                let match = coach.team.matchs.id(match_id);
                let schema = match.schemas;
                let stringAction = action.toString();
                console.log(action);
                schema.push(action);

                let sizeSchema = match.schemas.length;
                console.log(match.schemas);

                //id player with main action(but, tir cadré, tir non cadrées...)
                let id_statPlayer = schema[sizeSchema - 2];
                let id_playerRetrieveBall = schema[0];

                //BUT avec passeur and avant-passeur
                if (stringAction === 'but' && sizeSchema >= 4) {

                    let id_passeur = schema[sizeSchema - 3];
                    let id_avant_passeur = schema[sizeSchema - 4];


                    //buteur
                    Player.findById(id_statPlayer, function(err, buteur) {
                        updateStatPlayer(buteur, match_id, stringAction, err, coach_id);
                    });

                    //passeur
                    Player.findById(id_passeur, function(err, passeur) {
                        updateStatPlayer(passeur, match_id, 'assist', err, coach_id);
                    });

                    //avant-passeur
                    Player.findById(id_avant_passeur, function(err, avant_passeur) {
                        updateStatPlayer(avant_passeur, match_id, 'beforeAssist', err, coach_id);
                    });
                }

                //BUT with only one passeur
                if (action.toString() === 'but' && sizeSchema >= 3) {
                    let id_passeur = schema[sizeSchema - 3];

                    //buteur
                    Player.findById(id_statPlayer, function(err, buteur) {
                        updateStatPlayer(buteur, match_id, stringAction, err, coach_id);
                    });

                    //passeur
                    Player.findById(id_passeur, function(err, passeur) {
                        updateStatPlayer(passeur, match_id, 'assist', err, coach_id);
                    });

                }

                //handle action exclude "but"
                Player.findById(id_statPlayer, function(err, player) {
                    updateStatPlayer(player, match_id, stringAction, err, coach_id);
                });

                //handle player retrieve ball
                Player.findById(id_playerRetrieveBall, function(err, player) {
                    updateStatPlayer(player, match_id, 'retrieveBalls', err, coach_id);
                });

                coach.team.matchs.id(match_id).schemaMatch.push(coach.team.matchs.id(match_id).schemas);

                coach.team.matchs.id(match_id).schemas = [];

                coach.save();

                res.status(201).json({
                    success: true,
                    playerSelected: match.playerSelected
                })
            });
        } else {
            return res.status(403).send({
                success: false,
                msg: 'No token provided.'
            });
        }

    }

    // exports.numberTir = function(req, res) {
    //     let token = getToken(req.headers);
    //     let match_id = req.body.match_id;
    //     let player_id = req.body.player_id;
    //
    //     if (token) {
    //         let decoded = jwt.decode(token, config.secret);
    //         let coach_id = decoded._id;
    //
    //         Player.findById(player_id, function(err, player) {
    //           let playerStatistic = player.statistics;
    //
    //           for (let stat of playerSelected) {
    //             if (stat.match_id.toString() === match_id.toString()) {
    //               let tirs = stat.attemptsOnTarget + stat.attemptsOffTarget + stat.but;
    //
    //               stat.tirs
    //
    //             }
    //           }
    //         }
    //
    //     } else {
    //         return res.status(403).send({
    //             success: false,
    //             msg: 'No token provided.'
    //         });
    //     }
    //
    // }


    //count percentage relance and percentage passes success per a match
    let countPercent = function(player, idMatch, idCoach) {
        let playerStatistic = player.statistics;
        let percentRelance = 0;
        let percentPass = 0;

        for (let stat of playerStatistic) {
            if (stat.match_id.toString() === idMatch.toString()) {

                //count percentage passes success
                percentPass = 100 - (stat.ballLost * 100 / stat.ballPlayed);

                if (isNaN(percentPass)) {
                    percentPass = 0
                }
                stat.passesCompletion = percentPass;

                //count percentRelance
                percentRelance = stat.retrieveBalls * 100 / (stat.retrieveBalls + stat.defensiveAction);

                if (isNaN(percentRelance)) {
                    percentRelance = 0;
                }

                stat.relanceCompletion = percentRelance;
                console.log("relance completion : "+stat.relanceCompletion);
                player.save();
                console.log(playerStatistic);
                real_time.updateStatistic_firebase(player, idCoach, idCoach, {
                    statistics: {
                        assist: stat.assist,
                        retrieveBalls: stat.retrieveBalls,
                        foulsSuffered: stat.foulsSuffered,
                        foulsCommitted: stat.foulsCommitted,
                        yellowCard: stat.yellowCard,
                        redCard: stat.redCard,
                        attemptsOnTarget: stat.attemptsOnTarget,
                        attemptsOffTarget: stat.attemptsOffTarget,
                        beforeAssist: stat.beforeAssist,
                        matchPlayed: stat.matchPlayed,
                        firstTeamPlayer: stat.firstTeamPlayer,
                        substitute: stat.substitute,
                        but: stat.but,
                        ballLost: stat.ballLost,
                        ballPlayed: stat.ballPlayed,
                        passesCompletion: stat.passesCompletion,
                        defensiveAction: stat.defensiveAction,
                        relanceCompletion: stat.relanceCompletion,
                        offSide: stat.offSide,
                        passesFailed: stat.passesFailed,
                        crossesFailed: stat.crossesFailed,
                        saves: stat.saves,
                        claquettes: stat.claquettes,
                        sorties_aeriennes: stat.sorties_aeriennes,
                        clean_sheet: stat.clean_sheet
                    }
                });

            }
        }

    };


    exports.countPercent = function(req, res) {
        let token = getToken(req.headers);
        let idMatch = req.body.idMatch;

        if (token) {
            let decoded = jwt.decode(token, config.secret);
            let idCoach = decoded._id;

            Coach.findById(idCoach, function(err, coach) {
                if (err)
                    throw err;
                let playerSelected = coach.team.matchs.id(idMatch).playerSelected;
                console.log(coach.team.matchs);
                for (let idPlayer of playerSelected) {
                    Player.findById(idPlayer, function(err, player) {

                        if (err)
                            throw err;
                        countPercent(player, idMatch, idCoach);
                    });
                }

                res.status(201).json({
                    success: true,
                    player: playerSelected
                })
            });


        } else {
            return res.status(403).json({
                success: false,
                msg: 'No token provided.'
            });
        }

    };


    exports.avgRelance = function(req, res) {
        let token = getToken(req.headers);
        let match_id = req.body.match_id;


        console.log('match_id : ' + match_id);
        if (token) {
            let decoded = jwt.decode(token, config.secret);
            let coach_id = decoded._id;
            let totalPourRelance = 0;

            Coach.findById(coach_id, function(err, coach) {
                if (err)
                    throw err;

                //playerSelected
                let playersSelected = coach.team.matchs.id(match_id).playerSelected;
                //number of playerSelected
                let numberPlayer = playersSelected.length;

                //for every player selectionned we look for statistics related
                // to correct match and take relanceCompletion
                for (let player_id of playersSelected) {
                    Player.findById(player_id, function(err, player) {

                        let playerStatistic = player.statistics;

                        for (let stat of playerStatistic) {
                            if (stat.match_id.toString() === match_id.toString()) {
                                console.log("stat :" + JSON.stringify(stat));
                                totalPourRelance += stat.relanceCompletion;
                            }
                        }
                    });
                }

                //A Number, representing the nearest integer
                let avgRelance = Math.round((totalPourRelance / numberPlayer) * 100) / 100;

                res.status(201).json({
                    success: true,
                    avgRelance
                })
            });
        } else {
            return res.status(403).send({
                success: false,
                msg: 'No token provided.'
            });
        }

    }

    exports.updateStatistic = function(req, res) {

        let token = getToken(req.headers);
        let player_id = req.body.player_id;
        let match_id = req.body.match_id;
        let stat = req.body.stat;

        if (token) {
            let decoded = jwt.decode(token, config.secret);

            Player.findById(player_id, function(err, player) {
                if (err)
                    throw err;

                for (let i = 0, x = player.statistics.length; i < x; i++) {
                    if (player.statistics[i].match_id.toString() === match_id.toString()) {
                        player.statistics[i][stat]++;
                        //  console.log(player.statistics[i]);
                        real_time.updateStatistic_firebase(player, match_id, decoded._id, {
                            statistics: {
                                assist: player.statistics[i].assist,
                                retrieveBalls: player.statistics[i].retrieveBalls,
                                foulsSuffered: player.statistics[i].foulsSuffered,
                                foulsCommitted: player.statistics[i].foulsCommitted,
                                yellowCard: player.statistics[i].yellowCard,
                                redCard: player.statistics[i].redCard,
                                attemptsOnTarget: player.statistics[i].attemptsOnTarget,
                                attemptsOffTarget: player.statistics[i].attemptsOffTarget,
                                beforeAssist: player.statistics[i].beforeAssist,
                                matchPlayed: player.statistics[i].matchPlayed,
                                firstTeamPlayer: player.statistics[i].firstTeamPlayer,
                                substitute: player.statistics[i].substitute,
                                but: player.statistics[i].but,
                                ballLost: player.statistics[i].ballLost,
                                ballPlayed: player.statistics[i].ballPlayed,
                                passesCompletion: player.statistics[i].passesCompletion,
                                defensiveAction: player.statistics[i].defensiveAction,
                                relanceCompletion: player.statistics[i].relanceCompletion,
                                offSide: player.statistics[i].offSide,
                                passesFailed: player.statistics[i].passesFailed,
                                crossesFailed: player.statistics[i].crossesFailed,
                                saves: player.statistics[i].saves,
                                claquettes: player.statistics[i].claquettes,
                                sorties_aeriennes: player.statistics[i].sorties_aeriennes,
                                clean_sheet: player.statistics[i].clean_sheet
                            }
                        });
                    }
                }
                player.save();

                res.status(201).json({
                    success: true,
                    msg: stat + " update",
                    player: player
                });
            });

        } else {
            return res.status(403).send({
                success: false,
                msg: 'No token provided.'
            });
        }

    };
