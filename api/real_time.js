'use strict';
// function firebase

const MATCHS = 'matchs';
const PLAYERS_SELECTED = 'players_selected';
const PLAYERS_NO_SELECTED = 'players_no_selected';
const POSITION = 'position';
const STATISTICS = 'statistics';
const LIMIT_ACTION_REMOVE = 1;
const REF_COACH = 'https://boos.firebaseio.com/coaches';
const ACTIONS = 'actions';

let Firebase = require('firebase');
let ref = new Firebase(REF_COACH);
let Player = require('./models/player').modelPlayer;
let Football = require('./sports/football/football');
let Handball = require('./sports/handball/handball');

exports.resetPosition_firebase = (match_ID, coach_ID, player_ID) => {
  ref
    .child(coach_ID)
    .child(MATCHS)
    .child(match_ID)
    .child(PLAYERS_SELECTED)
    .child(player_ID)
    .child(POSITION)
    .set(null);
};

exports.resetPlayersSelected_firebase = (match_ID, coach_ID) => {
  ref
    .child(coach_ID)
    .child(MATCHS)
    .child(match_ID)
    .child(PLAYERS_SELECTED)
    .set(null);
};

exports.resetPlayersNoSelected_firebase = (match_ID, coach_ID) => {
  ref
    .child(coach_ID)
    .child(MATCHS)
    .child(match_ID)
    .child(PLAYERS_NO_SELECTED)
    .remove();
};

exports.addActions = (match_ID, coach_ID, actions) => {
  let refMatch = ref
    .child(coach_ID)
    .child(MATCHS)
    .child(match_ID)
    .child(ACTIONS);

  console.log(actions);
  if (actions[1] === 'but_opponent') {
    refMatch.push(actions);
  }
  if (['attemptStop', 'butsByAttempts', 'assist', 'retrieveBalls', 'foulsSuffered', 'foulsCommitted', 'yellowCard', 'redCard', 'attemptsOnTarget', 'attemptsOffTarget', 'but', 'ballLost', 'ballPlayed', 'defensiveAction', 'offSide', 'passesFailed', 'saves', 'dual_goalkeeper', 'sorties_aeriennes'].indexOf(actions[1]) >= 0) {
    Player.findById(actions[0], (err, player) => {
      actions[0] = `${player.last_name}`;
      refMatch.push(actions);
    });
  }

};

exports.removeLastActions_firebase = (match_ID, coach_ID) => {

  let refActions = ref
    .child(coach_ID)
    .child(MATCHS)
    .child(match_ID)
    .child(ACTIONS).limitToLast(LIMIT_ACTION_REMOVE);

  refActions.once('child_added', (snap) => {
    snap.ref().remove();
  });

};
exports.addStatisticsMatch = (match_ID, coach_ID, match, nameClub) => {

  let statistics = match.statistics;
  let stastisticSport;

  //if it's handball match
  if (match.sport === Handball.HANDBALL) {
    stastisticSport = {
      totalBallPlayed: statistics.totalBallPlayed,
      totalBallLost: statistics.totalBallLost,
      totalFoulsSuffered: statistics.totalFoulsSuffered,
      totalFoulsCommited: statistics.totalFoulsCommited,
      totalAttempts: statistics.totalAttempts,
      totalAttemptsOnTarget: statistics.totalAttemptsOnTarget,
      totalAttemptsOffTarget: statistics.totalAttemptsOffTarget,
      totalBut: statistics.totalBut,
      totalRedCard: statistics.totalRedCard,
      totalYellowCard: statistics.totalYellowCard,
      totalPassesFailed: statistics.totalPassesFailed,
      but_opponent: statistics.but_opponent,
      totalDisqualification: statistics.totalDisqualification,
      totalWarning: statistics.totalWarning,
      totalTwoMinutes: statistics.totalTwoMinutes,
      totalButsByPenalty: statistics.totalButsByPenalty,
      totalButsByAttemps: statistics.totalButsByAttemps,
      totalPenalty: statistics.totalPenalty

    }
  } else if (match.sport === Football.FOOTBALL) {
    //if it's football match
    stastisticSport = {
      totalBallPlayed: statistics.totalBallPlayed,
      totalBallLost: statistics.totalBallLost,
      totalPassesCompletion: statistics.totalPassesCompletion,
      totalRetrieveBalls: statistics.totalRetrieveBalls,
      totalRelanceCompletion: statistics.totalRelanceCompletion,
      totalFoulsSuffered: statistics.totalFoulsSuffered,
      totalFoulsCommited: statistics.totalFoulsCommited,
      totalOffSide: statistics.totalOffSide,
      totalAttempts: statistics.totalAttempts,
      totalAttemptsOnTarget: statistics.totalAttemptsOnTarget,
      totalAttemptsOffTarget: statistics.totalAttemptsOffTarget,
      totalYellowCard: statistics.totalYellowCard,
      totalRedCard: statistics.totalRedCard,
      totalBut: statistics.totalBut,
      totalPassesFailed: statistics.totalPassesFailed,
      but_opponent: statistics.but_opponent
    };

  }

  let refMatch = ref
    .child(coach_ID)
    .child(MATCHS)
    .child(match_ID)
    .set({
      name_team: nameClub,
      type: match.type,
      place: match.place,
      against_team: match.against_team,
      actions: [],
      sport: match.sport,
      statistics: stastisticSport
    });

};
exports.addPlayer_firebase = (player, match_ID, coach_ID, selected) => {
  //get stat for the good match
  let getStatMatch = (stat) => stat.match_id === match_ID;
  let stat = player.statistics.filter(getStatMatch);

  let playerSelected = selected ? PLAYERS_SELECTED : PLAYERS_NO_SELECTED;
  let firebase_player;

  if (player.sport === Football.FOOTBALL) {
    firebase_player = {
      id: player._id,
      first_name: player.first_name,
      last_name: player.last_name,
      position: player.position,
      favourite_position: player.favourite_position,
      statistics: {
        assist: stat[0].assist,
        retrieveBalls: stat[0].retrieveBalls,
        foulsSuffered: stat[0].foulsSuffered,
        foulsCommitted: stat[0].foulsCommitted,
        yellowCard: stat[0].yellowCard,
        redCard: stat[0].redCard,
        attemptsOnTarget: stat[0].attemptsOnTarget,
        attemptsOffTarget: stat[0].attemptsOffTarget,
        attempts: stat[0].attempts,
        beforeAssist: stat[0].beforeAssist,
        matchPlayed: stat[0].matchPlayed,
        firstTeamPlayer: stat[0].firstTeamPlayer,
        substitute: stat[0].substitute,
        but: stat[0].but,
        ballLost: stat[0].ballLost,
        ballPlayed: stat[0].ballPlayed,
        passesCompletion: stat[0].passesCompletion,
        defensiveAction: stat[0].defensiveAction,
        relanceCompletion: stat[0].relanceCompletion,
        offSide: stat[0].offSide,
        passesFailed: stat[0].passesFailed,
        crossesFailed: stat[0].crossesFailed,
        saves: stat[0].saves,
        dual_goalkeeper: stat[0].dual_goalkeeper,
        sorties_aeriennes: stat[0].sorties_aeriennes,
        clean_sheet: stat[0].clean_sheet
      }
    };
  } else if (player.sport === Handball.HANDBALL) {
    firebase_player = {
      id: player._id,
      first_name: player.first_name,
      last_name: player.last_name,
      position: player.position,
      favourite_position: player.favourite_position,
      statistics: {
        ballPlayed: stat[0].ballPlayed,
        assist: stat[0].assist,
        attemptsOnTarget: stat[0].attemptsOnTarget,
        attemptsOffTarget: stat[0].attemptsOffTarget,
        attempts: stat[0].attempts,
        attemptStop: stat[0].attemptStop,
        but: stat[0].but,
        saves: stat[0].saves,
        penalty: stat[0].penalty,
        penaltyOffTarget: stat[0].penaltyOffTarget,
        penaltyOnTarget: stat[0].penaltyOnTarget,
        penaltyStop: stat[0].penaltyStop,
        butsByAttempts: stat[0].butsByAttempts,
        butsByPenalty: stat[0].butsByPenalty,
        twoMinutes: stat[0].twoMinutes,
        warning: stat[0].warning,
        disqualification: stat[0].disqualification,
        foulsSuffered: stat[0].foulsSuffered,
        foulsCommitted: stat[0].foulsCommitted,
        yellowCard: stat[0].yellowCard,
        redCard: stat[0].redCard,
        ballLost: stat[0].ballLost,
        attemptsDefence: stat[0].attemptsDefence,
        interception: stat[0].interception,
        defence: stat[0].defence
      }
    };
  }
  ref
    .child(coach_ID)
    .child(MATCHS)
    .child(match_ID)
    .child(playerSelected)
    .child(player._id.toString())
    .set(firebase_player);
};


exports.removePlayerSelected_firebase = function(player, match_ID, coach_ID) {
  let refAddPlayer = ref
    .child(coach_ID)
    .child(MATCHS)
    .child(match_ID)
    .child(PLAYERS_SELECTED)
    .child(player._id.toString())
    .set(null);
};

exports.updateStatistic_firebase = function(player, match_ID, coach_ID, stat) {

  ref
    .child(coach_ID)
    .child(MATCHS)
    .child(match_ID)
    .child(PLAYERS_SELECTED)
    .child(player._id.toString())
    .child(STATISTICS)
    .update(stat);

};

exports.switchPosition_firebase = (fstPlayerId, sndPlayerId, matchId, coachId) => {


  let refMatch = ref
    .child(coachId.toString())
    .child(MATCHS)
    .child(matchId.toString());

  let refPlayerSelected = refMatch.child(PLAYERS_SELECTED);

  let refPlayerNoSelected = refMatch.child(PLAYERS_NO_SELECTED);

  let referenceFstPlayer = refPlayerSelected.child(fstPlayerId.toString());
  let referenceSndPlayer = refPlayerSelected.child(sndPlayerId.toString());

  let referenceFstPlayerNo = refPlayerNoSelected.child(fstPlayerId.toString());
  let referenceSndPlayerNo = refPlayerNoSelected.child(sndPlayerId.toString());

  refPlayerSelected.once('value', (snapPlayerSelected) => {
    refPlayerNoSelected.once('value', (snapPlayerNoSelected) => {
      let fstPlayerSelectedExists = snapPlayerSelected.child(fstPlayerId).exists();
      let sndPlayerSelectedExists = snapPlayerSelected.child(sndPlayerId).exists();

      let fstPlayerNoSelectedExists = snapPlayerNoSelected.child(fstPlayerId).exists();
      let sndPlayerNoSelectedExists = snapPlayerNoSelected.child(sndPlayerId).exists();

      if (fstPlayerSelectedExists && sndPlayerNoSelectedExists) {
        referenceFstPlayer.once('value', (fstPlayer) => {
          referenceSndPlayerNo.once('value', (sndPlayer) => {
            //  console.log(fstPlayer.val());
            refPlayerNoSelected.child(fstPlayer.key())
              .set({
                id: fstPlayer.val().id,
                first_name: fstPlayer.val().first_name,
                last_name: fstPlayer.val().last_name,
                favourite_position: fstPlayer.val().favourite_position
              });
            refPlayerSelected.child(fstPlayer.key()).set(null);

            //  console.log(sndPlayer);
            refPlayerSelected.child(sndPlayer.key())
              .set({
                id: sndPlayer.val().id,
                first_name: sndPlayer.val().first_name,
                last_name: sndPlayer.val().last_name,
                favourite_position: sndPlayer.val().favourite_position,
                position: fstPlayer.val().position
              });

            refPlayerNoSelected.child(sndPlayer.key()).set(null);

          });
        });
      }

      if (fstPlayerNoSelectedExists && sndPlayerSelectedExists) {
        referenceSndPlayer.once('value', (sndPlayer) => {
          referenceFstPlayerNo.once('value', (fstPlayer) => {

            refPlayerNoSelected.child(sndPlayer._id)
              .set({
                id: sndPlayer._id,
                first_name: sndPlayer.first_name,
                last_name: sndPlayer.last_name,
                favourite_position: sndPlayer.favourite_position
              });
            refPlayerSelected.child(sndPlayer._id).set(null);

            refPlayerSelected.child(fstPlayer._id)
              .set({
                id: sndPlayer._id,
                first_name: sndPlayer.first_name,
                last_name: sndPlayer.last_name,
                favourite_position: sndPlayer.favourite_position,
                position: fstPlayer.position
              });

            refPlayerNoSelected.child(fstPlayer._id).set(null);

          });
        });
      }
    });
  });

  refPlayerSelected.once('value', (snapPlayerSelected) => {
    let fstPlayerExists = snapPlayerSelected.child(fstPlayerId).exists();
    let sndPlayerExists = snapPlayerSelected.child(sndPlayerId).exists();
    //        console.log(fstPlayerExists, sndPlayerExists);
    if (fstPlayerExists && sndPlayerExists) {
      referenceFstPlayer.once('value', function(fstPlayer) {

        referenceSndPlayer.once('value', function(sndPlayer) {
          console.log('ok');
          referenceFstPlayer.update({
            position: sndPlayer.val().position
          });
          referenceSndPlayer.update({
            position: fstPlayer.val().position
          });
          //console.log(sndPlayer.val());
          //console.log(fstPlayer.val());
        });
      });
    }
  });
};

exports.cleanReference_firebase = (coachId, matchId) => {
  let refMatch = ref
    .child(coachId.toString())
    .child(MATCHS)
    .child(matchId.toString());

  let refPlayerSelected = refMatch.child(PLAYERS_SELECTED).remove();

  let refPlayerNoSelected = refMatch.child(PLAYERS_NO_SELECTED).remove();


};

exports.removeMatch_firebase = (coachId, matchId) => {
  let refMatch = ref
    .child(coachId.toString())
    .child(MATCHS)
    .child(matchId.toString()).set(null);
};

exports.updateStatMatch_firebase = (coachId, matchId, stat) => {

  let refMatch = ref
    .child(coachId.toString())
    .child(MATCHS)
    .child(matchId.toString())
    .child(STATISTICS);

  refMatch.update(stat);
}
