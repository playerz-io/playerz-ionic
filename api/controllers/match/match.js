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
let Handball = require('../../sports/handball/handball');
let privateMatch = require('./private');

const POSITION_ERROR_MSG = `Il vous manque un joueur qui a pour poste favori : `;
//add new match
exports.addMatch = function(req, res) {


  let data = res.locals.data;
  let against_team = req.body.against_team;
  let place = req.body.place;
  let type = req.body.type;
  let date = req.body.date;

  let idCoach = data.id;

  if (!against_team || !place || !type || !date) {
    let msg = "Certains champs n'ont pas été saisies";
    return Utils.error(res, msg);
  }


  Coach.findById(idCoach, (err, coach) => {
    if (err) {
      return Utils.errorIntern(res, err);
    }

    let newMatch;

    if (coach.sport === Football.FOOTBALL) {

      newMatch = new Match({
        team: coach.team.name_club.toUpperCase(),
        against_team: against_team.toUpperCase(),
        place,
        type,
        date: new Date(date),
        belongs_to: idCoach,
        defaultPosition: false,
        status: 'comeup',
        sport: coach.sport,
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

    } else if (coach.sport === Handball.HANDBALL) {

      newMatch = new Match({
        team: coach.team.name_club.toUpperCase(),
        against_team: against_team.toUpperCase(),
        place,
        type,
        date: new Date(date),
        belongs_to: idCoach,
        defaultPosition: false,
        status: 'comeup',
        sport: coach.sport,
        statistics: {
          totalBallPlayed: 0,
          totalBallLost: 0,
          totalFoulsCommited: 0,
          totalFoulsSuffered: 0,
          totalAttempts: 0,
          totalAttemptsOnTarget: 0,
          totalAttemptsOffTarget: 0,
          totalBut: 0,
          totalRedCard: 0,
          totalYellowCard: 0,
          totalPassesFailed: 0,
          but_opponent: 0,
          totalDisqualification: 0,
          totalWarning: 0,
          totalTwoMinutes: 0,
          totalButsByPenalty: 0,
          totalButsByAttemps: 0,
          totalPenalty: 0
        }
      });

    }

    let nameClub = coach.team.name_club;

    console.log(newMatch);
    real_time.addStatisticsMatch(newMatch._id.toString(), idCoach, newMatch, nameClub);

    newMatch.save((err) => {
      if (err) {
        return Utils.errorIntern(res, err);
      }
    });

    coach.team.matchs.push(newMatch);

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

};

//get all match d'un coach
exports.getMatchs = function(req, res) {

  let data = res.locals.data;

  Coach.findById(data.id, function(err, coach) {
    if (err)
      return Utils.errorIntern(res, err);

    res.status(200).json({
      success: true,
      matchs: coach.team.matchs
    });
  });
};

//get match d'un coach by id
exports.getMatchById = function(req, res) {

  let data = res.locals.data;

  Coach.findById(data.id, function(err, coach) {
    if (err)
      return Utils.errorIntern(res, err);

    let match = coach.team.matchs.id(req.params.id);
    res.status(200).json({
      success: true,
      match: match
    });
  });
};

//remove le match d'un coach
exports.removeMatch = function(req, res) {

  let data = res.locals.data;
  let idMatch = req.body.id;

  Coach.findById(data.id, function(err, coach) {
    if (err)
      return Utils.errorIntern(res, err);

    let match = coach.team.matchs.id(idMatch);
    //console.log('MATCH : '+JSON.stringify(match));
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
};

//choisir une formation pour un match
exports.addFormation = function(req, res) {

  let data = res.locals.data;
  let idMatch = req.body.id;
  let formation = req.body.formation;

  Coach.findById(data.id, function(err, coach) {

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

      res.status(200).json({
        success: true,
        match: match
      });
    });
  });
};

//return post Football in fonction of tactique
exports.getTactique = function(req, res) {

  let data = res.locals.data;
  let tactique = req.query.tactique;

  if (tactique === Football.QQDEUX) {
    return res.status(200).json({
      success: true,
      tactique: Football.QQDEUX_POST
    });
  } else if (tactique === Football.QQTTROIS) {
    return res.status(200).json({
      success: true,
      tactique: Football.QTTROIS_POST
    });
    // TODO: postes 3-5-2 à faire
  } else if (tactique === Football.TCDEUX) {
    return res.status(200).json({
      success: true,
      tactique: 'posts 3-5-2'
    });
  } else {
    return res.status(400).json({
      success: false
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

  let data = res.locals.data;
  let matchId = req.query.match_id;
  console.log(matchId);
  Coach.findById(data.id)
    .populate('team.matchs.playerSelected')
    .exec(function(err, coach) {
      //    console.log(coach.team.matchs.id(matchId).playerSelected);
      if (err)
        return Utils.errorIntern(res, err);

      let playerSelected = coach.team.matchs.id(matchId).playerSelected;
      //  console.log('d'+playerSelected);
      return res.status(200).json({
        success: true,
        playerSelected
      });
    });
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

  let data = res.locals.data;
  let idMatch = req.body.match_id;
  let countGD = 0;
  let idCoach = data.id;

  async.waterfall([
    (done) => {
      Coach.findById(idCoach, (err, coach) => {
        if (err)
          return Utils.errorIntern(res, err);

        let team = coach.team;
        let match = team.matchs.id(idMatch);
        let players = team.players;


        if (coach.sport === Football.FOOTBALL) {
          if (players.length < Football.NUMBER_FIRST_PLAYER) {
            return res.status(400).json({
              success: false,
              msg: `Vous devez avoir avoir au moins ${Football.NUMBER_FIRST_PLAYER} joueurs dans votre effectif.`
            });
          }
        } else if (coach.sport === Handball.HANDBALL) {
          if (players.length < Handball.NUMBER_FIRST_PLAYER) {
            return res.status(400).json({
              success: false,
              msg: `Vous devez avoir avoir au moins ${Handball.NUMBER_FIRST_PLAYER} joueurs effectif.`
            });
          }

        }

        if (match.playerSelected.length !== 0) {

          match.playerSelected = [];

          real_time.resetPlayersSelected_firebase(idMatch, idCoach);
        }
        if (match.playerNoSelected.length !== 0) {

          match.playerNoSelected = [];
          real_time.resetPlayersNoSelected_firebase(idMatch, idCoach);
        }
        let playersSelected = match.playerSelected;
        let playersNoSelected = match.playerNoSelected;

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

              if (match.formation === Football.QQDEUX) {

                for (let player of playersTeam) {

                  // placement du gardien
                  if (player.favourite_position === Football.POSTS.GD && GD_QQD === false) {
                    console.log(`id match ${idMatch}`);
                    privateMatch._defaultPosition(player, idMatch, 'GD', idCoach, playersSelected, foundMatch);
                    console.log('defaultPosition_____', playersSelected);
                    GD_QQD = true;
                    maxPlayer++;
                    continue;

                  }

                  if ((player.favourite_position === Football.POSTS.DEF || player.favourite_position === Football.POSTS.AR) && DFG_QQD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'DFG', idCoach, playersSelected, foundMatch);
                    console.log('defaultPosition_____', playersSelected);
                    DFG_QQD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.DEF || player.favourite_position === Football.POSTS.AR) && DFD_QQD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'DFD', idCoach, playersSelected, foundMatch);
                    console.log('defaultPosition_____', playersSelected);
                    DFD_QQD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AR || player.favourite_position === Football.POSTS.DEF) && ARG_QQD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ARG', idCoach, playersSelected, foundMatch);
                    ARG_QQD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AR || player.favourite_position === Football.POSTS.DEF) && ARD_QQD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ARD', idCoach, playersSelected, foundMatch);
                    ARD_QQD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MD || player.favourite_position === Football.POSTS.MC) && MCD_QQD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MCD', idCoach, playersSelected, foundMatch);
                    MCD_QQD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MD || player.favourite_position === Football.POSTS.MC) && MCG_QQD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MCG', idCoach, playersSelected, foundMatch);
                    MCG_QQD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MO || player.favourite_position === Football.POSTS.AI) && MD_QQD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MD', idCoach, playersSelected, foundMatch);
                    MD_QQD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MO || player.favourite_position === Football.POSTS.AI) && MG_QQD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MG', idCoach, playersSelected, foundMatch);
                    MG_QQD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AV || player.favourite_position === Football.POSTS.AI) && ATG_QQD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ATG', idCoach, playersSelected, foundMatch);
                    ATG_QQD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AV || player.favourite_position === Football.POSTS.AI) && ATD_QQD === false) {
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

                //Check if all positon are full
                if (!GD_QQD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.GD);
                }

                if (!DFG_QQD || !DFD_QQD || !ARD_QQD || !ARG_QQD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.DEF + ' ou ' + Football.POSTS.AR);
                }

                if (!MCD_QQD || !MCG_QQD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.MD + ' ou ' + Football.POSTS.MC);
                }

                if (!MD_QQD || !MG_QQD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.MO + ' ou ' + Football.POSTS.AI);
                }

                if (!ATG_QQD || !ATD_QQD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.AV + ' ou ' + Football.POSTS.AI);
                }
              } //if QQDEUX

              if (match.formation === Football.QTTROIS) {
                console.log('4-4-3');
                for (let player of playersTeam) {

                  // placement du gardien
                  if (player.favourite_position === Football.POSTS.GD && GD_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'GD', idCoach, playersSelected, foundMatch);
                    GD_QTT = true;
                    maxPlayer++;
                    continue;

                  }

                  if ((player.favourite_position === Football.POSTS.DEF || player.favourite_position === Football.POSTS.AR) && DFG_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'DFG', idCoach, playersSelected, foundMatch);
                    DFG_QTT = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.DEF || player.favourite_position === Football.POSTS.AR) && DFD_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'DFD', idCoach, playersSelected, foundMatch);
                    DFD_QTT = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AR || player.favourite_position === Football.POSTS.DEF) && ARG_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ARG', idCoach, playersSelected, foundMatch);
                    ARG_QTT = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AR || player.favourite_position === Football.POSTS.DEF) && ARD_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ARD', idCoach, playersSelected, foundMatch);
                    ARD_QTT = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MD || player.favourite_position === Football.POSTS.MC) && MC_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MC', idCoach, playersSelected, foundMatch);
                    MC_QTT = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MD || player.favourite_position === Football.POSTS.MC) && MCG_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MCG', idCoach, playersSelected, foundMatch);
                    MCG_QTT = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MD || player.favourite_position === Football.POSTS.MC) && MCD_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MCD', idCoach, playersSelected, foundMatch);
                    MCD_QTT = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MO || player.favourite_position === Football.POSTS.AI) && ATG_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ATG', idCoach, playersSelected, foundMatch);
                    ATG_QTT = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MO || player.favourite_position === Football.POSTS.AI) && ATD_QTT === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ATD', idCoach, playersSelected, foundMatch);
                    ATD_QTT = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AV || player.favourite_position === Football.POSTS.AI) && AV_QTT === false) {
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

                //Check if all positon are full
                if (!GD_QTT) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.GD);
                }

                if (!DFG_QTT || !DFD_QTT || !ARD_QTT || !ARG_QTT) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.DEF + ' ou ' + Football.POSTS.AR);
                }

                if (!MCD_QTT || !MCG_QTT || !MC_QTT) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.MD + ' ou ' + Football.POSTS.MC);
                }

                if (!ATD_QTT || !ATG_QTT) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.MO + ' ou ' + Football.POSTS.AI);
                }

                if (!AV_QTT) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.AV + ' ou ' + Football.POSTS.AI);
                }

              } //if QQTTROIS

              //TCDEUX
              if (match.formation === Football.TCDEUX) {
                for (let player of playersTeam) {
                  // placement du gardien
                  if (player.favourite_position === Football.POSTS.GD && GD_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'GD', idCoach, playersSelected, foundMatch);
                    GD_TCD = true;
                    maxPlayer++;
                    continue;

                  }

                  if ((player.favourite_position === Football.POSTS.DEF || player.favourite_position === Football.POSTS.AR) && DC_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'DC', idCoach, playersSelected, foundMatch);
                    DC_TCD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.DEF || player.favourite_position === Football.POSTS.AR) && DCG_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'DCG', idCoach, playersSelected, foundMatch);
                    DCG_TCD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.DEF || player.favourite_position === Football.POSTS.AR) && DCD_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'DCD', idCoach, playersSelected, foundMatch);
                    DCD_TCD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AR || player.favourite_position === Football.POSTS.AI) && ARG_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ARG', idCoach, playersSelected, foundMatch);
                    ARG_TCD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AR || player.favourite_position === Football.POSTS.AI) && ARD_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ARD', idCoach, playersSelected, foundMatch);
                    ARD_TCD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MD || player.favourite_position === Football.POSTS.MC) && MC_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MC', idCoach, playersSelected, foundMatch);
                    MC_TCD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MD || player.favourite_position === Football.POSTS.MC) && MCG_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MCG', idCoach, playersSelected, foundMatch);
                    MCG_TCD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.MD || player.favourite_position === Football.POSTS.MC) && MCD_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'MCD', idCoach, playersSelected, foundMatch);
                    MCD_TCD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AV || player.favourite_position === Football.POSTS.AI) && ATG_TCD === false) {
                    privateMatch._defaultPosition(player, idMatch, 'ATG', idCoach, playersSelected, foundMatch);
                    ATG_TCD = true;
                    maxPlayer++;
                    continue;
                  }

                  if ((player.favourite_position === Football.POSTS.AV || player.favourite_position === Football.POSTS.AI) && ATD_TCD === false) {
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

                //Check if all positon are full
                if (!GD_TCD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.GD);
                }

                if (!DC_TCD || !DCG_TCD || !DCD_TCD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.DEF + ' ou ' + Football.POSTS.AR);
                }

                if (!ARG_TCD || !ARD_TCD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.AR + ' ou ' + Football.POSTS.AI);
                }

                if (!MCD_TCD || !MCG_TCD || !MC_TCD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.MD + ' ou ' + Football.POSTS.MC);
                }

                if (!ATD_TCD || !ATG_TCD) {
                  return Utils.error(res, POSITION_ERROR_MSG + Football.POSTS.AV + ' ou ' + Football.POSTS.AI);
                }

              } //if TCDEUX
            } else if (coach.sport === Handball.HANDBALL) {

              let GD = false,
                DC = false,
                ARG = false,
                ARD = false,
                AIG = false,
                AID = false,
                PIV = false;

              for (let player of playersTeam) {
                // placement du gardien
                if (player.favourite_position === Handball.POSTS.GD && GD === false) {
                  privateMatch._defaultPosition(player, idMatch, 'GD', idCoach, playersSelected, foundMatch);
                  GD = true;
                  maxPlayer++;
                  continue;

                }

                if (player.favourite_position === Handball.POSTS.DC && DC === false) {
                  privateMatch._defaultPosition(player, idMatch, 'DC', idCoach, playersSelected, foundMatch);
                  DC = true;
                  maxPlayer++;
                  continue;
                }

                if (player.favourite_position === Handball.POSTS.AR && ARG === false) {
                  privateMatch._defaultPosition(player, idMatch, 'ARG', idCoach, playersSelected, foundMatch);
                  ARG = true;
                  maxPlayer++;
                  continue;
                }

                if (player.favourite_position === Handball.POSTS.AR && ARD === false) {
                  privateMatch._defaultPosition(player, idMatch, 'ARD', idCoach, playersSelected, foundMatch);
                  ARD = true;
                  maxPlayer++;
                  continue;
                }

                if (player.favourite_position === Handball.POSTS.AI && AIG === false) {
                  privateMatch._defaultPosition(player, idMatch, 'AIG', idCoach, playersSelected, foundMatch);
                  AIG = true;
                  maxPlayer++;
                  continue;
                }

                if (player.favourite_position === Handball.POSTS.AI && AID === false) {
                  privateMatch._defaultPosition(player, idMatch, 'AID', idCoach, playersSelected, foundMatch);
                  AID = true;
                  maxPlayer++;
                  continue;
                }

                if (player.favourite_position === Handball.POSTS.PI && PIV === false) {
                  privateMatch._defaultPosition(player, idMatch, 'PIV', idCoach, playersSelected, foundMatch);
                  PIV = true;
                  maxPlayer++;
                  continue;
                }

                if (maxSubstitute < Handball.NUMBER_SUBSTITUTE) {
                  privateMatch._defaultPosition(player, idMatch, 'REM', idCoach, playersSelected, foundMatch);
                  maxSubstitute++;
                  continue;
                }
              } //for

            }
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

};

//switch position entre 2 joueurs selectionnés.
//switch position entre un joueur selectioné et un non selectioné
exports.switchPosition = (req, res) => {

  let data = res.locals.data;
  let player_id_one = req.body.player_id_one;
  let player_id_two = req.body.player_id_two;
  let match_id = req.body.match_id;
  let idCoach = data.id;

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
};

exports.addOpponentBut = (req, res) => {

  let data = res.locals.data;
  let match_id = req.body.match_id;
  let time = req.body.time;
  let coach_id = data.id;

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
};

exports.putMatchFinished = (req, res) => {

  let data = res.locals.data;
  let match_id = req.body.match_id;
  let coach_id = data.id;
  let result = '';

  Coach.findById(coach_id, (coachErr, coach) => {
    if (coachErr)
      return Utils.errorIntern(res, coachErr);

    Match.findById(match_id, (matchErr, match) => {

      if (matchErr)
        return Utils.errorIntern(res, matchErr);

      let matchCoach = coach.team.matchs.id(match_id);
      let statMatch = matchCoach.statistics;
      console.log(matchCoach);

      if (statMatch.totalBut === statMatch.but_opponent) {
        result = 'draw';
      }
      if (statMatch.totalBut > statMatch.but_opponent) {
        result = 'victory';
      }

      if (statMatch.totalBut < statMatch.but_opponent) {
        result = 'defeat';
      }
      matchCoach.status = "finished";

      //set clean_sheet
      if (matchCoach.statistics.but_opponent === 0) {
        matchCoach.statistics.clean_sheet = 1;
      }
      console.log('matchCoach.statistics.clean_sheet', matchCoach.statistics);
      matchCoach.result = result;

      coach.save((err) => {
        if (err)
          return Utils.errorIntern(res, err);
      });

      match.status = 'finished';

      //set clean_sheet
      if (match.statistics.but_opponent === 0) {
        match.statistics.clean_sheet = 1;
      }

      match.result = result;

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
};

exports.getGlobalStatisticsMatch = (req, res) => {
  let data = res.locals.data;
  let statisticsGlobal = {
    'totalBallPlayed': 0,
    'totalBallLost': 0,
    'totalRetrieveBalls': 0,
    'totalFoulsSuffered': 0,
    'totalFoulsCommited': 0,
    'totalOffSide': 0,
    'totalAttempts': 0,
    'totalAttemptsOnTarget': 0,
    'totalAttemptsOffTarget': 0,
    'totalBut': 0,
    'totalPassesCompletion': 0,
    'totalRelanceCompletion': 0,
    'totalRedCard': 0,
    'totalDefensiveAction': 0,
    'totalYellowCard': 0,
    'totalPassesFailed': 0,
    'but_opponent': 0
  };

  let keyStatisticsGlobal = Object.keys(statisticsGlobal);
  let coachId = data.id;
  let nbrMatchFinished = 0;

  Coach.findById(coachId, (err, coach) => {
    if (err) {
      return Utils.errorIntern(res, err);
    }
    let matchs = coach.team.matchs;
    for (let match of matchs) {
      if (match.status === 'finished') {
        nbrMatchFinished++;
        let statistics = match.statistics;

        for (let key of keyStatisticsGlobal) {
          statisticsGlobal[key] += statistics[key];
        }
      }
    }

    statisticsGlobal.totalPassesCompletion = Math.round(statisticsGlobal.totalPassesCompletion / nbrMatchFinished);
    statisticsGlobal.totalRelanceCompletion = Math.round(statisticsGlobal.totalRelanceCompletion / nbrMatchFinished);

    res.status(200).json({
      success: true,
      statisticsGlobal,
      nbrMatchFinished
    });
  });
};

// get five last match played of coach
exports.getLastMatch = (req, res) => {
  let data = res.locals.data;
  let coachId = data.id;

  Coach.findById(coachId, (err, coach) => {
    if (err) {
      return Utils.errorIntern(res, err);
    }

    let lastMatchs;
    let matchsFinished = [];
    let matchs = coach.team.matchs;

    for (let match of matchs) {
      if (match.status === 'finished') {
        matchsFinished.push(match);
      }
    }

    let nbrMatchsFinished = matchs.length;

    if (nbrMatchsFinished < 5) {
      lastMatchs = matchsFinished.slice(-nbrMatchsFinished);
    } else {
      lastMatchs = matchsFinished.slice(-5);
    }

    res.status(200).json({
      nbrMatchsFinished,
      lastMatchs
    });
  });
};
