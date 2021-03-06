'use strict';


let jwt = require('jwt-simple');
let config = require('../../config/database');
let Match = require('../../models/match').modelMatch;
let Coach = require('../../models/coach').modelCoach;
let Player = require('../../models/player').modelPlayer;
let Statistic = require('../../models/statistics').modelStatistic;
// let real_time = require('../../real_time');
let async = require('async');
let Football = require('../../sports/football/football');
let Handball = require('../../sports/handball/handball');


let _addStatisticsToPlayer = (player, match_id) => {


  let newStatistics;
  if (player.sport === Football.FOOTBALL) {
    newStatistics = new Statistic({
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
      passesCompletion: 100,
      defensiveAction: 0,
      relanceCompletion: 100,
      offSide: 0,
      clean_sheet: 0,
      sorties_aeriennes: 0,
      dual_goalkeeper: 0,
      saves: 0,
      crossesFailed: 0,
      passesFailed: 0
    });
  } else if (player.sport === Handball.HANDBALL) {
    newStatistics = new Statistic({
      match_id: match_id.toString(),
      assist: 0,
      attemptsOnTarget: 0,
      attemptsOffTarget: 0,
      attempts: 0,
      attemptStop: 0,
      penalty: 0,
      penaltyOffTarget: 0,
      penaltyOnTarget: 0,
      penaltyStop: 0,
      but: 0,
      butsByAttempts: 0,
      butsByPenalty: 0,
      twoMinutes: 0,
      warning: 0,
      ballLost: 0,
      attemptsDefence: 0,
      interception: 0,
      defence: 0,
      disqualification: 0,
      saves: 0,
      ballPlayed: 0,
      yellowCard: 0,
      redCard: 0,
      foulsSuffered: 0,
      foulsCommitted: 0
    });
    console.log('new stats: ', newStatistics);
  }

  player.statistics.push(newStatistics);
};

//check if stat for this match already exists
exports.addStatisticsToPlayer = function(player, match_id) {

  console.log('defaultPosition');
  let statExist = false;
  if (player.statistics.length === 0) {
    _addStatisticsToPlayer(player, match_id)
  }

  for (let i = 0, x = player.statistics.length; i < x; i++) {
    if (player.statistics[i].match_id.toString() === match_id.toString()) {
      statExist = true
    }
  }

  if (!statExist) {
    _addStatisticsToPlayer(player, match_id.toString());

  }

};

exports._findMatch = function(status, req, res) {

  let data = res.locals.data;
  let idCoach = data.id;
  let matchsStatus = [];

  Coach.findById(idCoach, (err, coach) => {

    if (err)
      return Utils.errorIntern(res, err);

    let matchs = coach.team.matchs;
    for (let match of matchs) {
      if (match.status === status) {
        matchsStatus.push(match)
      }
    }

    res.status(201).json({
      success: true,
      matchs: matchsStatus
    });
  });
};

exports._defaultPosition = (player, idMatch, position, idCoach, playersSelected, foundMatch) => {

  //
  // Match.findById(idMatch, (err, foundMatch) => {
  console.log(player.last_name, position);
  console.log("playersSelected", playersSelected);
  console.log('indexOf', playersSelected.indexOf(player._id));
  if (foundMatch.playerSelected.indexOf(player._id) < 0) {
    foundMatch.playerSelected.push(player);
  }

  foundMatch.save();

  if (playersSelected.indexOf(player._id) < 0) {
    console.log('oysh');
    playersSelected.push(player);
    console.log('defaultPosition', playersSelected);
  }

  exports.addStatisticsToPlayer(player, idMatch);
  player.position = position;
  player.save((err) => {
    if (err)
      return Utils.errorIntern(res, err);
  });

  console.log(idMatch);
  //console.log('player.position', player.position);
  real_time.addPlayer_firebase(player, idMatch, idCoach, true);
  // });

};

exports._setDefaultPosition = (idMatch, idCoach, defaultPosition) => {

  Coach.findById(idCoach, (err, coach) => {

    Match.findById(idMatch, (err, foundMatch) => {

      let match = coach.team.match.id(idMatch);
      match.defaultPosition = defaultPosition;

      coach.save();

      foundMatch.defaultPosition = defaultPosition;
      foundMatch.save();

    });
  });
};

exports._resetPosition = (match_ID, coach_ID, player_ID) => {
  Player.findById(player_ID, (err, player) => {
    player.position = null;
    real_time.resetPosition_firebase(match_ID, coach_ID, player_ID)

    player.save();
  });
}
