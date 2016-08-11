  //controller player
  'use strict'

  let realTime = require('../real_time');
  let getToken = require('./token');
  let jwt = require('jwt-simple');
  let config = require('../config/database');
  let Player = require('../models/player').modelPlayer;
  let Match = require('../models/match').modelMatch;
  let Coach = require('../models/coach').modelCoach;
  let async = require('async');

  exports.addPosition = function(req, res) {

      let position = req.body.position;
      let idPlayer = req.body.player_id;
      let idMatch = req.body.match_id;

      let token = getToken(req.headers);

      if (token) {
          let decoded = jwt.decode(token, config.secret);
          let idCoach = decoded._id;


          Player.findById(idPlayer, function(err, player) {

              if (err)
                  return Utils.errorIntern(res, err);

              console.log(player, idMatch, idCoach)
              player.position = position;
              realTime.updateStatistic_firebase(player, idMatch, idCoach, {
                  first_name: player.first_name,
                  last_name: player.last_name,
                  id: player._id,
                  favourite_position: player.favourite_position,
                  position: position
              });
              player.save((err) => {
                  if (err)
                      return Utils.errorIntern(res, err);
              });

              res.status(201).json({
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

  exports.getMatchPlayed = (req, res) => {

      let token = getToken(req.headers);
      let player_id = req.query.player_id;

      if (token) {
          let decoded = jwt.decode(token, config.secret);
          let coach_id = decoded._id;

          async.waterfall([

              (cb) => {
                  Coach.findById(coach_id, (err, coach) => {

                      if (err)
                          return Utils.errorIntern(res, err);

                      let matchPlayed = [];
                      let matchs = coach.team.matchs;
                      for (let match of matchs) {
                          let playerSelected = match.playerSelected;
                          if (playerSelected.indexOf(player_id) >= 0) {
                              matchPlayed.push(match._id);
                          }
                      }

                      cb(null, matchPlayed);
                  });
              },
              (matchPlayed, cb) => {

                  Match.find({
                      _id: {
                          "$in": matchPlayed
                      },
                      status: 'finished'
                  }, (err, match) => {
                      if (err)
                          return Utils.errorIntern(res, err);

                      cb(null, match);
                  });
              }
          ], (err, matchs) => {
              if (err)
                  return Utils.errorIntern(res, err);
              res.status(202).json({
                  success: true,
                  matchs
              });
          });

      } else {
          return res.status(403).send({
              success: false,
              msg: 'No token provided.'
          });
      }
  };


  exports.getStatisticsMatch = (req, res) => {

      let token = getToken(req.headers);
      let player_id = req.query.player_id;
      let match_id = req.query.match_id;

      if (token) {

          Player.findById(player_id, (err, player) => {

              if (err)
                  return Utils.errorIntern(res, err);

              let statistics = player.statistics;

              for (let stat of statistics) {
                  if (stat.match_id === match_id) {
                      return res.status(202).json({
                          success: true,
                          stat
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

  exports.getGlobalStatistics = (req, res) => {

      let token = getToken(req.headers);
      let player_id = req.query.player_id;

      let statisticsGlobal = {
          "passesFailed": 0,
          "crossesFailed": 0,
          "saves": 0,
          "dual_goalkeeper": 0,
          "sorties_aeriennes": 0,
          "clean_sheet": 0,
          "offSide": 0,
          "relanceCompletion": 0,
          "defensiveAction": 0,
          "passesCompletion": 0,
          "ballPlayed": 0,
          "ballLost": 0,
          "but": 0,
          "substitute": 0,
          "firstTeamPlayer": 0,
          "matchPlayed": 0,
          "beforeAssist": 0,
          "attempts": 0,
          "attemptsOffTarget": 0,
          "attemptsOnTarget": 0,
          "redCard": 0,
          "yellowCard": 0,
          "foulsCommitted": 0,
          "foulsSuffered": 0,
          "retrieveBalls": 0,
          "assist": 0,
      };

      let keyStatisticsGlobal = Object.keys(statisticsGlobal);

      if (token) {
          let decoded = jwt.decode(token, config.secret);
          let coach_id = decoded._id;

          async.waterfall([

              (cb) => {
                  Coach.findById(coach_id, (err, coach) => {
                      if (err)
                          return Utils.errorIntern(res, err);
                      let matchPlayed = [];
                      let matchs = coach.team.matchs;
                      for (let match of matchs) {
                          let playerSelected = match.playerSelected;
                          if (playerSelected.indexOf(player_id) >= 0) {
                              matchPlayed.push(match._id);

                          }
                      }

                      cb(null, matchPlayed);
                  });
              },
              (matchPlayed, cb) => {
                  Player.findById(player_id, (err, player) => {

                      let statistics = player.statistics;
                      //convert array object in array string
                      let matchPlayedString = matchPlayed.map(String);

                      for (let stat of statistics) {

                          if (matchPlayedString.indexOf(stat.match_id) >= 0) {

                              for (let key of keyStatisticsGlobal) {
                                  statisticsGlobal[key] += stat[key];
                              }
                          }
                      }
                      statisticsGlobal.passesCompletion = statisticsGlobal.passesCompletion / matchPlayed.length;
                      statisticsGlobal.relanceCompletion = statisticsGlobal.passesCompletion / matchPlayed.length;

                      cb(null, statisticsGlobal, matchPlayed);
                  });

              }
          ], (err, matchs, matchPlayed) => {
              if (err)
                  return Utils.errorIntern(res, err);

              res.status(202).json({
                  success: true,
                  statisticsGlobal,
                  nbrMatchPlayed: matchPlayed.length
              });
          });

      } else {
          return res.status(403).send({
              success: false,
              msg: 'No token provided.'
          });
      }
  };
