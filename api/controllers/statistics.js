'use strict';

let getToken = require('./token');
let jwt = require('jwt-simple');
let config = require('../config/database');
let Player = require('../models/player').modelPlayer;
let Match = require('../models/match').modelMatch;
let Coach = require('../models/coach').modelCoach;
let real_time = require('../real_time');
let async = require('async');
let Utils = require('../utils');

// update statistics of player
let updateStatPlayer = function(player, match_id, stat, err, coach_id, minus) {
    //console.log(player);
    let numberAttempts = 0;
    let percentPass = 0;
    let percentRelance = 0;
    let lostBall = 0;

    for (let i = 0, x = player.statistics.length; i < x; i++) {
        let statistics = player.statistics[i];

        //verify that is correct statistics
        if (statistics.match_id.toString() === match_id.toString()) {
            //  console.log(player);

            if (err)
                return Utils.errorIntern(res, err);

            if (minus === true) {
                statistics[stat]--;
            } else {
                statistics[stat]++;
            }


            numberAttempts = statistics.attemptsOnTarget + statistics.attemptsOffTarget + statistics.but;
            if (isNaN(numberAttempts)) {
                numberAttempts = 0
            }
            statistics.attempts = numberAttempts;
            //count percentage passes success
            percentPass = 100 - (statistics.ballLost * 100 / statistics.ballPlayed);

            if (isNaN(percentPass)) {
                percentPass = 0
            }
            statistics.passesCompletion = percentPass;

            //count percentRelance
            percentRelance = statistics.retrieveBalls * 100 / (statistics.retrieveBalls + statistics.defensiveAction);

            if (isNaN(percentRelance)) {
                percentRelance = 0;
            }
            statistics.relanceCompletion = percentRelance;

            //ballLost

            lostBall = statistics.ballLost + statistics.passesFailed + statistics.crossesFailed;
            if (isNaN(lostBall)) {
                lostBall = 0;
            }
            statistics.ballLost = lostBall;

            console.log(i, statistics);
            player.save((err) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });
            totalStat(coach_id.toString(), match_id.toString());
            real_time.updateStatistic_firebase(player, match_id, coach_id, {
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
            });

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
                return Utils.errorIntern(res, err);

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
                return Utils.errorIntern(res, err);

            let match = coach.team.matchs.id(match_id);
            match.schemas.push(data);

            coach.save((err) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });

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
                        return Utils.errorIntern(res, err);

                    let match = coach.team.matchs.id(match_id);
                    let schema = match.schemas;
                    let stringAction = action.toString();
                    schema.push(action);
                    schema.push(time);
                    let sizeSchema = match.schemas.length;

                    //id player with main action(but, tir cadré, tir non cadrées...)
                    let id_statPlayer = schema[sizeSchema - 3];
                    //  let id_playerRetrieveBall = schema[0];

                    done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);

                });
            },

            (stringAction, match, schema, sizeSchema, id_statPlayer, coach, done) => {
                if (stringAction === 'but' && sizeSchema >= 5) {
                    //buteur
                    Player.findById(id_statPlayer, function(err, buteur) {
                        updateStatPlayer(buteur, match_id, stringAction, err, coach_id, false);
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                    });
                } else {
                    done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                }

            },

            (stringAction, match, schema, sizeSchema, id_statPlayer, coach, done) => {
                //passeur
                if (stringAction === 'but' && sizeSchema >= 5) {
                    let id_passeur = schema[sizeSchema - 4];
                    Player.findById(id_passeur, function(err, passeur) {
                        updateStatPlayer(passeur, match_id, 'assist', err, coach_id, false);
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                    });
                } else {
                    done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                }

            },

            (stringAction, match, schema, sizeSchema, id_statPlayer, coach, done) => {
                //avant-passeur
                //add (schema[sizeSchema - 5] !== schema[sizeSchema - 3]) in case of one two
                if (stringAction === 'but' && sizeSchema >= 5 && (schema[sizeSchema - 5] !== schema[sizeSchema - 3])) {
                    let id_avant_passeur = schema[sizeSchema - 5];
                    Player.findById(id_avant_passeur, function(err, avant_passeur) {
                        updateStatPlayer(avant_passeur, match_id, 'beforeAssist', err, coach_id, false);
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                    });
                } else {
                    done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                }

            },

            (stringAction, match, schema, sizeSchema, id_statPlayer, coach, done) => {

                if (action.toString() === 'but' && sizeSchema === 4) {
                    //buteur
                    Player.findById(id_statPlayer, function(err, buteur) {
                        updateStatPlayer(buteur, match_id, stringAction, err, coach_id, false);
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                    });
                } else {
                    done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                }

            },

            (stringAction, match, schema, sizeSchema, id_statPlayer, coach, done) => {

                if (action.toString() === 'but' && sizeSchema === 4) {
                    //passeur
                    let id_passeur = schema[sizeSchema - 4];

                    Player.findById(id_passeur, function(err, passeur) {
                        updateStatPlayer(passeur, match_id, 'assist', err, coach_id, false);
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                    });
                } else {
                    done(null, stringAction, match, schema, sizeSchema, id_statPlayer, coach);
                }


            },

            (stringAction, match, schema, sizeSchema, id_statPlayer, coach, done) => {

                let actions = ['ballLost', 'but', 'defensiveAction', 'attemptsOffTarget', 'attemptsOnTarget', 'ballLost', 'foulsSuffered', 'foulsCommitted', 'redCard', 'yellowCard', 'crossesFailed', 'passesFailed', undefined, null];

                //verifie pour une action de but si nous sommmes pas dans les cas précédent
                if (!((stringAction === 'but' && sizeSchema === 4) || (stringAction === 'but' && sizeSchema >= 5))) {
                    //check if id_statPlayer is not equal any actions
                    if (actions.indexOf(id_statPlayer) === -1) {
                        Player.findById(id_statPlayer, function(err, player) {
                            console.log('but');
                            updateStatPlayer(player, match_id, stringAction, err, coach_id, false);
                            done(null, stringAction, match, schema, sizeSchema, id_statPlayer, actions, coach);
                        });
                    } else {
                        done(null, stringAction, match, schema, sizeSchema, id_statPlayer, actions, coach);
                    }

                } else {
                    done(null, stringAction, match, schema, sizeSchema, id_statPlayer, actions, coach);
                }

            },

            (stringAction, match, schema, sizeSchema, id_statPlayer, actions, coach, done) => {
                match.schemaMatch.push(match.schemas);
                real_time.addActions(match_id, coach_id, match.schemas.slice(-3));
                match.schemas = [];

                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);
                });

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

let getThreeLastAction = (coach, match_id) => {

    Coach.findById(coach._id, (err, coach) => {
      let match = coach.team.match.id(match_id)
    });
};


//count percentage relance and percentage passes success per a match and attempts
// statistic that required calculation
// CALL IN exports.countPercent
// let countPercent = function(player, idMatch, idCoach) {
//     let playerStatistic = player.statistics;
//     let percentRelance = 0;
//     let percentPass = 0;
//     let numberAttempts = 0;
//
//     for (let stat of playerStatistic) {
//         if (stat.match_id.toString() === idMatch.toString()) {
//
//             //count number attempts
//             numberAttempts = stat.attemptsOnTarget + stat.attemptsOffTarget + stat.but;
//             if (isNaN(numberAttempts)) {
//                 numberAttempts = 0
//             }
//
//             stat.attempts = numberAttempts;
//             //count percentage passes success
//             percentPass = 100 - (stat.ballLost * 100 / stat.ballPlayed);
//
//             if (isNaN(percentPass)) {
//                 percentPass = 0
//             }
//             stat.passesCompletion = percentPass;
//
//             //count percentRelance
//             percentRelance = stat.retrieveBalls * 100 / (stat.retrieveBalls + stat.defensiveAction);
//
//             if (isNaN(percentRelance)) {
//                 percentRelance = 0;
//             }
//
//             stat.relanceCompletion = percentRelance;
//             player.save();
//
//             real_time.updateStatistic_firebase(player, idMatch, idCoach, {
//                 statistics: {
//                     assist: stat.assist,
//                     retrieveBalls: stat.retrieveBalls,
//                     foulsSuffered: stat.foulsSuffered,
//                     foulsCommitted: stat.foulsCommitted,
//                     yellowCard: stat.yellowCard,
//                     redCard: stat.redCard,
//                     attemptsOnTarget: stat.attemptsOnTarget,
//                     attemptsOffTarget: stat.attemptsOffTarget,
//                     attempts: stat.attempts,
//                     beforeAssist: stat.beforeAssist,
//                     matchPlayed: stat.matchPlayed,
//                     firstTeamPlayer: stat.firstTeamPlayer,
//                     substitute: stat.substitute,
//                     but: stat.but,
//                     ballLost: stat.ballLost,
//                     ballPlayed: stat.ballPlayed,
//                     passesCompletion: stat.passesCompletion,
//                     defensiveAction: stat.defensiveAction,
//                     relanceCompletion: stat.relanceCompletion,
//                     offSide: stat.offSide,
//                     passesFailed: stat.passesFailed,
//                     crossesFailed: stat.crossesFailed,
//                     saves: stat.saves,
//                     claquettes: stat.claquettes,
//                     sorties_aeriennes: stat.sorties_aeriennes,
//                     clean_sheet: stat.clean_sheet
//                 }
//             });
//
//         }
//     }
// };


// exports.countPercent = function(req, res) {
//     let token = getToken(req.headers);
//     let idMatch = req.body.idMatch;
//
//
//     if (token) {
//         let decoded = jwt.decode(token, config.secret);
//         let idCoach = decoded._id;
//
//         Match.findById(idMatch, function(err, match) {
//             if (err)
//                 throw err;
//
//             match.status = 'finished';
//             match.save();
//         })
//         Coach.findById(idCoach, function(err, coach) {
//             if (err)
//                 throw err;
//
//             let match = coach.team.matchs.id(idMatch);
//             let playerSelected = match.playerSelected;
//
//
//             //Match finished
//             match.status = 'finished';
//             coach.save();
//
//             console.log(coach.team.matchs);
//             for (let idPlayer of playerSelected) {
//                 Player.findById(idPlayer, function(err, player) {
//
//                     if (err)
//                         throw err;
//                     countPercent(player, idMatch, idCoach);
//                 });
//             }
//
//             res.status(201).json({
//                 success: true,
//                 player: playerSelected
//             })
//         });
//
//     } else {
//         return res.status(403).json({
//             success: false,
//             msg: 'No token provided.'
//         });
//     }
//
// };

// TODO: save à vérifié
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
                return Utils.errorIntern(res, err);


            //playerSelected
            let playersSelected = coach.team.matchs.id(match_id).playerSelected;
            //number of playerSelected
            let numberPlayer = playersSelected.length;

            //for every player selectionned we look for statistics related
            // to correct match and take relanceCompletion
            for (let player_id of playersSelected) {
                Player.findById(player_id, function(err, player) {
                    if (err)
                        return Utils.errorIntern(res, err);

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
    let percentPass = 0

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Player.findById(player_id, function(err, player) {
            if (err)
                return Utils.errorIntern(res, err);

            for (let i = 0, x = player.statistics.length; i < x; i++) {
                if (player.statistics[i].match_id.toString() === match_id.toString()) {
                    let statistics = player.statistics[i];
                    statistics[stat]++;

                    //count percentage passes success
                    percentPass = 100 - (statistics.ballLost * 100 / statistics.ballPlayed);

                    if (isNaN(percentPass)) {
                        percentPass = 0
                    }
                    statistics.passesCompletion = percentPass;

                    real_time.updateStatistic_firebase(player, match_id, decoded._id, {
                        ballPlayed: statistics.ballPlayed,
                        passesCompletion: statistics.passesCompletion
                    });
                }
            }
            player.save((err) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });
            totalStat(decoded._id, match_id);
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

let totalStat = function(_coach_id, _match_id) {

    let match_id = _match_id;

    let coach_id = _coach_id;

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
        totalRelanceCompletion = 0,
        but_opponent = 0;

    async.waterfall([
        (cb) => {
            Coach.findById(coach_id, (err, coach) => {
                if (err)
                    return Utils.errorIntern(res, err);

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

                    if (err)
                        throw err;

                    let playerStatistic = player.statistics;
                    for (let stat of playerStatistic) {
                        //don't add but_opponent
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
                            totalPassesCompletion: Math.round(totalPassesCompletion / numberPlayerSelected),
                            totalRelanceCompletion: Math.round(totalRelanceCompletion / numberPlayerSelected),
                            but_opponent: match.statistics.but_opponent
                        });
                    }
                });
            }
        },
        (coach, match, stat, cb) => {

            Match.findById(match_id, (err, foundMatch) => {
                if (err)
                    throw err;

                //update match stat
                foundMatch.statistics = {
                    totalBallPlayed: stat.totalBallPlayed,
                    totalBallLost: stat.totalBallLost,
                    totalPassesCompletion: stat.totalPassesCompletion,
                    totalRetrieveBalls: stat.totalRetrieveBalls,
                    totalDefensiveAction: stat.totalDefensiveAction,
                    totalRelanceCompletion: stat.totalRelanceCompletion,
                    totalFoulsSuffered: stat.totalFoulsSuffered,
                    totalFoulsCommited: stat.totalFoulsCommited,
                    totalOffSide: stat.totalOffSide,
                    totalAttempts: stat.totalAttempts,
                    totalAttemptsOnTarget: stat.totalAttemptsOnTarget,
                    totalAttemptsOffTarget: stat.totalAttemptsOffTarget,
                    but_opponent: stat.but_opponent,
                    totalBut: stat.totalBut

                };
                foundMatch.save();
            });

            match.statistics = {
                totalBallPlayed: stat.totalBallPlayed,
                totalBallLost: stat.totalBallLost,
                totalPassesCompletion: stat.totalPassesCompletion,
                totalRetrieveBalls: stat.totalRetrieveBalls,
                totalDefensiveAction: stat.totalDefensiveAction,
                totalRelanceCompletion: stat.totalRelanceCompletion,
                totalFoulsSuffered: stat.totalFoulsSuffered,
                totalFoulsCommited: stat.totalFoulsCommited,
                totalOffSide: stat.totalOffSide,
                totalAttempts: stat.totalAttempts,
                totalAttemptsOnTarget: stat.totalAttemptsOnTarget,
                totalAttemptsOffTarget: stat.totalAttemptsOffTarget,
                but_opponent: stat.but_opponent,
                totalBut: stat.totalBut

            };
            console.log('match.statistics', match.statistics);
            coach.save();

            cb(null, stat);
        }
    ], (err, result) => {
        if (err)
            throw err;
        console.log(result);
        real_time.updateStatMatch_firebase(coach_id.toString(), match_id.toString(), result);
    });
};

exports.removeAction = (req, res) => {

    let token = getToken(req.headers);
    let match_id = req.body.match_id;

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let idCoach = decoded._id;

        Coach.findById(idCoach, (err, coach) => {

            if (err)
                return Utils.errorIntern(res, err);

            console.log(coach);
            let match = coach.team.matchs.id(match_id);
            let sizeSchemaMatch = match.schemaMatch.length;
            let schemaMatch = match.schemaMatch;
            let lastSchema = schemaMatch[sizeSchemaMatch - 1];
            let sizeLastSchema = (lastSchema === undefined) ? 0 : lastSchema.length;
            let schema = match.schemas;
            let sizeSchema = schema.length;

            if (sizeSchema !== 0) {
                let idPlayerRemoved = schema.splice(sizeSchema - 1, 1);
                Player.findById(idPlayerRemoved, (err, player) => {
                    updateStatPlayer(player, match_id, 'ballPlayed', err, idCoach, true);
                    coach.save((err) => {
                        if (err)
                            return Utils.errorIntern(res, err);
                    });
                    return res.status(202).json({
                        success: true,
                        msg: `${Utils.getAction('ballPlayed')} de ${player.last_name} ${player.first_name} est annulé`
                    })
                });
            } else {
                //check if sizeLastSchema equals 3
                if (sizeLastSchema >= 3) {
                    //remove 3 dernier item du dernier schema
                    //schemaRemoved contains [ '577a4211c02b9a386444063e', 'but', '00:09' ]
                    // lastSchema = schemaMatch[sizeSchemaMatch - 1] - [ '577a4211c02b9a386444063e', 'but', '00:09' ]
                    let schemaRemoved = lastSchema.splice(sizeLastSchema - 3, 3);
                    match.schemas = lastSchema;

                    //removed last schema
                    schemaMatch.splice(sizeSchemaMatch - 1, 1);

                    let idPlayerRemoved = schemaRemoved[0];
                    let actionRemoved = schemaRemoved[1];

                    coach.save((err) => {
                        if (err)
                            return Utils.errorIntern(res, err);
                    });

                    Player.findById(idPlayerRemoved, (err, player) => {
                        if (err)
                            return Utils.errorIntern(res, err);
                        updateStatPlayer(player, match_id, actionRemoved, err, idCoach, true);

                        res.status(202).json({
                            success: true,
                            msg: `${Utils.getAction(actionRemoved)} de ${player.last_name} ${player.first_name} est annulé`
                        })
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        msg: `Il n'y a plus d'actions a annulé`
                    });
                }
            }
        });

    } else {

        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }

};

exports.getStatMatch = (req, res) => {

    let match_id = req.query.match_id;
    let token = getToken(req.headers);


    if (token) {

        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;

        Coach.findById(coach_id, (err, coach) => {

            if (err)
                return Utils.errorIntern(res, err);

            let match = coach.team.matchs.id(match_id);
            console.log(match_id);
            let statistics = match.statistics;

            res.status(200).json({
                success: true,
                statistics
            });
        });
    } else {
        return res.status(403).json({
            success: false,
            msg: 'No token provided.'
        });
    }
}
