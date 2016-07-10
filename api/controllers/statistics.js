    'use strict';

    let getToken = require('./token');
    let jwt = require('jwt-simple');
    let config = require('../config/database');
    let Player = require('../models/player').modelPlayer;
    let Match = require('../models/match').modelMatch;
    let Coach = require('../models/coach').modelCoach;
    let real_time = require('../real_time');
    let async = require('async');

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
                console.log(statistics);
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
                        attempts: statistics.attempts,
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
        let time = req.body.time;

        if (token) {
            let decoded = jwt.decode(token, config.secret);
            let coach_id = decoded._id;

            async.waterfall([
                (done) => {
                    Coach.findById(coach_id, (err, coach) => {
                        if (err)
                            throw err;

                        let match = coach.team.matchs.id(match_id);
                        let schema = match.schemas;
                        let stringAction = action.toString();
                        // TODO: add time
                        schema.push(action);
                        schema.push(time);
                        let sizeSchema = match.schemas.length;

                        //id player with main action(but, tir cadré, tir non cadrées...)
                        let id_statPlayer = schema[sizeSchema - 3];
                        let id_playerRetrieveBall = schema[0];

                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);

                    });
                },

                (stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach, done) => {
                    if (stringAction === 'but' && sizeSchema >= 5) {
                        //buteur
                        Player.findById(id_statPlayer, function(err, buteur) {
                            updateStatPlayer(buteur, match_id, stringAction, err, coach_id);
                            done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                        });
                    } else {
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                    }

                },

                (stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach, done) => {
                    //passeur
                    if (stringAction === 'but' && sizeSchema >= 5) {
                        let id_passeur = schema[sizeSchema - 4];
                        Player.findById(id_passeur, function(err, passeur) {
                            updateStatPlayer(passeur, match_id, 'assist', err, coach_id);
                            done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                        });
                    } else {
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                    }

                },

                (stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach, done) => {
                    //avant-passeur
                    if (stringAction === 'but' && sizeSchema >= 5) {
                        let id_avant_passeur = schema[sizeSchema - 5];
                        Player.findById(id_avant_passeur, function(err, avant_passeur) {
                            updateStatPlayer(avant_passeur, match_id, 'beforeAssist', err, coach_id);
                            done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                        });
                    } else {
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                    }

                },

                (stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach, done) => {

                    if (action.toString() === 'but' && sizeSchema == 4) {
                        //buteur
                        Player.findById(id_statPlayer, function(err, buteur) {
                            updateStatPlayer(buteur, match_id, stringAction, err, coach_id);
                            done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                        });
                    } else {
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                    }

                },

                (stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach, done) => {

                    if (action.toString() === 'but' && sizeSchema == 4) {
                        //passeur
                        let id_passeur = schema[sizeSchema - 4];

                        Player.findById(id_passeur, function(err, passeur) {
                            updateStatPlayer(passeur, match_id, 'assist', err, coach_id);
                            done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                        });
                    } else {
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach);
                    }


                },

                (stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, coach, done) => {

                    let actions = ['ballLost', 'but', 'defensiveAction', 'attemptsOffTarget', 'attemptsOnTarget', 'ballLost', 'foulsSuffered', 'foulsCommitted', 'redCard', 'yellowCard', 'crossesFailed', 'passesFailed', undefined, null];
                    //check if id_statPlayer is not equal any actions
                    if (actions.indexOf(id_statPlayer) === -1) {
                        //handle all action exclude "but"
                        Player.findById(id_statPlayer, function(err, player) {
                            updateStatPlayer(player, match_id, stringAction, err, coach_id);
                            done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, actions, coach);
                        });
                    } else {
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, actions, coach);
                    }


                },

                (stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, actions, coach, done) => {
                    //check if id_playerRetrieveBall is not equal any actions
                    if (actions.indexOf(id_playerRetrieveBall) === -1) {
                        //handle player retrieve ball
                        Player.findById(id_playerRetrieveBall, function(err, player) {
                            updateStatPlayer(player, match_id, 'retrieveBalls', err, coach_id);
                            done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, actions, coach);
                        });
                    } else {
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, actions, coach);
                    }
                },

                (stringAction, match, schema, sizeSchema, id_statPlayer, id_playerRetrieveBall, actions, coach, done) => {
                    coach.team.matchs.id(match_id).schemaMatch.push(coach.team.matchs.id(match_id).schemas);

                    coach.team.matchs.id(match_id).schemas = [];

                    coach.save();

                    res.status(201).json({
                        success: true,
                        playerSelected: match.playerSelected
                    });
                }

            ]);

        } else {
            return res.status(403).send({
                success: false,
                msg: 'No token provided.'
            });
        }

    };


    //count percentage relance and percentage passes success per a match and attempts
    // statistic that required calculation
    // CALL IN exports.countPercent
    let countPercent = function(player, idMatch, idCoach) {
        let playerStatistic = player.statistics;
        let percentRelance = 0;
        let percentPass = 0;
        let numberAttempts = 0;

        for (let stat of playerStatistic) {
            if (stat.match_id.toString() === idMatch.toString()) {

                //count number attempts
                numberAttempts = stat.attemptsOnTarget + stat.attemptsOffTarget + stat.but;
                if (isNaN(numberAttempts)) {
                    numberAttempts = 0
                }

                stat.attempts = numberAttempts;
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
                player.save();

                real_time.updateStatistic_firebase(player, idMatch, idCoach, {
                    statistics: {
                        assist: stat.assist,
                        retrieveBalls: stat.retrieveBalls,
                        foulsSuffered: stat.foulsSuffered,
                        foulsCommitted: stat.foulsCommitted,
                        yellowCard: stat.yellowCard,
                        redCard: stat.redCard,
                        attemptsOnTarget: stat.attemptsOnTarget,
                        attemptsOffTarget: stat.attemptsOffTarget,
                        attempts: stat.attempts,
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

            Match.findById(idMatch, function(err, match) {
                if (err)
                    throw err;

                match.status = 'finished';
                match.save();
            })
            Coach.findById(idCoach, function(err, coach) {
                if (err)
                    throw err;

                let match = coach.team.matchs.id(idMatch);
                let playerSelected = match.playerSelected;


                //Match finished
                match.status = 'finished';
                coach.save();

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

    };

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
                                attempts: player.statistics[i].attempts,
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

    exports.totalStat = function(req, res) {
        let token = getToken(req.headers);
        let match_id = req.body.match_id;

        if (token) {

            let decoded = jwt.decode(token, config.secret);
            let coach_id = decoded._id;

            let totalBallPlayed = 0,
                totalBallLost = 0,
                totalRetrieveBalls = 0,
                totalDefensiveAction = 0,
                totalFoulsSuffered = 0,
                totalFoulsCommited = 0,
                totalOffSide = 0,
                totalAttempts = 0,
                totalAttemptsOnTarget = 0,
                totalAttemptsOffTarget = 0,
                totalBut = 0,
                totalPassesCompletion = 0,
                totalRelanceCompletion = 0
                butOpponent = 0;


            async.waterfall([
                (cb) => {
                    Coach.findById(coach_id, (err, coach) => {
                        if (err)
                            throw err;

                        let match = coach.team.matchs.id(match_id)

                        //player selected
                        let playerSelected = match.playerSelected;
                        //number of player selected
                        let numberPlayerSelected = playerSelected.length;
                        cb(null, numberPlayerSelected, playerSelected, match, coach)

                    });
                },

                (numberPlayerSelected, playerSelected, match, coach, cb) => {
                    console.log(playerSelected);
                    for (let player_id of playerSelected) {

                        Player.findById(player_id, (err, player) => {
                            let playerStatistic = player.statistics;
                            for (let stat of playerStatistic) {

                                if (stat.match_id.toString() === match_id.toString()) {
                                    //console.log(stat);
                                    totalBallPlayed += stat['ballPlayed'];
                                    totalBallLost += stat['ballLost'];
                                    totalRetrieveBalls += stat['retrieveBalls'];
                                    totalDefensiveAction += stat['defensiveAction'];
                                    totalFoulsSuffered += stat['foulsSuffered'];
                                    totalFoulsCommited += stat['foulsCommitted'];
                                    totalOffSide += stat['offSide'];
                                    totalAttempts += stat['attempts'];
                                    totalAttemptsOnTarget += stat['attemptsOnTarget'];
                                    totalAttemptsOffTarget += stat['attemptsOffTarget'];
                                    totalBut += stat['but'];
                                    totalPassesCompletion += stat['passesCompletion'];
                                    totalRelanceCompletion += stat['relanceCompletion'];
                                    butOpponent += stat['but_opponent'];

                                }
                            }
                            if (player_id === playerSelected[numberPlayerSelected - 1]) {
                                cb(null, coach, match, {
                                    totalBallPlayed,
                                    totalBallLost,
                                    totalRetrieveBalls,
                                    totalDefensiveAction,
                                    totalFoulsSuffered,
                                    totalFoulsCommited,
                                    totalOffSide,
                                    totalAttempts,
                                    totalAttemptsOnTarget,
                                    totalAttemptsOffTarget,
                                    totalBut,
                                    butOpponent,
                                    totalPassesCompletion: Math.round(totalPassesCompletion / numberPlayerSelected),
                                    totalRelanceCompletion: Math.round(totalRelanceCompletion / numberPlayerSelected)
                                });
                            }
                        });


                    }

                },
                (coach, match, stat, cb) => {

                    Match.findById(match_id, (err, foundMatch) => {
                        if (err)
                            throw err;
                        //console.log(foundMatch);

                        //update match stat
                        foundMatch.statistics = {
                            ballPlayed: stat.totalBallPlayed,
                            ballLost: stat.totalBallLost,
                            passesCompletion: stat.totalPassesCompletion,
                            retrieveBalls: stat.totalRetrieveBalls,
                            defensiveAction: stat.totalDefensiveAction,
                            relanceCompletion: stat.totalRelanceCompletion,
                            foulsSuffered: stat.totalFoulsSuffered,
                            foulsCommitted: stat.totalFoulsCommited,
                            offSide: stat.totalOffSide,
                            attempts: stat.totalAttempts,
                            attemptsOnTarget: stat.totalAttemptsOnTarget,
                            attemptsOffTarget: stat.totalAttemptsOffTarget,
                            butOpponent: stat.but_opponent,
                            but: stat.totalBut

                        };
                        foundMatch.save();
                    });

                    match.statistics = {
                        ballPlayed: stat.totalBallPlayed,
                        ballLost: stat.totalBallLost,
                        passesCompletion: stat.totalPassesCompletion,
                        retrieveBalls: stat.totalRetrieveBalls,
                        defensiveAction: stat.totalDefensiveAction,
                        relanceCompletion: stat.totalRelanceCompletion,
                        foulsSuffered: stat.totalFoulsSuffered,
                        foulsCommitted: stat.totalFoulsCommited,
                        offSide: stat.totalOffSide,
                        attempts: stat.totalAttempts,
                        attemptsOnTarget: stat.totalAttemptsOnTarget,
                        attemptsOffTarget: stat.totalAttemptsOffTarget,
                        but: stat.totalBut

                    };
                    coach.save();
                    console.log(stat);
                    //  console.log(coach);
                    cb(null, stat);
                }
            ], (err, result) => {
                if (err)
                    throw err;

                res.status(202).json({
                    success: true,
                    match_statistics: result
                });

            });

        } else {
            return res.status(403).send({
                success: false,
                msg: 'No token provided.'
            });
        };
    };
