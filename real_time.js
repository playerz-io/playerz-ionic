'use strict'
//function firebase

let Firebase = require('firebase');
let ref = new Firebase('https://boos.firebaseio.com/coaches');
let async = require('async');
let Player = require('./models/player').modelPlayer;



let checkMatchId = function(match_ID, player) {
    return matchID === player.match_id;
};

exports.resetPosition_firebase = (match_ID, coach_ID, player_ID) => {
  let refActions = ref
  .child(coach_ID)
  .child('matchs')
  .child(match_ID)
  .child('players_selected')
  .child(player_ID)
  .child('position')
  .set(null);
};

exports.addActions = (match_ID, coach_ID, actions) => {

    if (['assist', 'retrieveBalls', 'foulsSuffered', 'foulsCommitted', 'yellowCard', 'redCard', 'attemptsOnTarget', 'attemptsOffTarget', 'but', 'ballLost', 'ballPlayed', 'defensiveAction', 'offSide', 'passesFailed', 'saves', 'dual_goalkeeper', 'sorties_aeriennes'].indexOf(actions[1]) >= 0) {
        Player.findById(actions[0], (err, player) => {
            actions[0] = `${player.last_name}`;
            let refMatch = ref
                .child(coach_ID)
                .child('matchs')
                .child(match_ID)
                .child('actions')
                .push(actions);
        });
    }

};

exports.removeLastActions_firebase = (match_ID, coach_ID) => {

    let listActions = [];
    let refActions = ref
        .child(coach_ID)
        .child('matchs')
        .child(match_ID)
        .child('actions').limitToLast(1);

    refActions.once('child_added', (snap) => {

        snap.ref().remove();
    });

};
exports.addStatisticsMatch = (match_ID, coach_ID, match) => {

    let statistics = match.statistics;
    console.log(match.type, match.place, match.against_team);
    let refMatch = ref
        .child(coach_ID)
        .child('matchs')
        .child(match_ID)
        .set({
            type: match.type,
            place: match.place,
            against_team: match.against_team,
            actions: [],
            statistics: {
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
            }
        });

};
exports.addPlayer_firebase = (player, match_ID, coach_ID, selected) => {

  //  console.log('ok');
    //get stat for the good match
    let getStatMatch = (stat) => stat.match_id === match_ID;
    let stat = player.statistics.filter(getStatMatch);

    let playerSelected = selected ? 'players_selected' : 'players_no_selected';

    let refAddPlayer = ref
        .child(coach_ID)
        .child("matchs")
        .child(match_ID)
        .child(playerSelected)
        .child(player._id.toString())
        .set({
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
        });
};


exports.removePlayerSelected_firebase = function(player, match_ID, coach_ID) {
    let refAddPlayer = ref
        .child(coach_ID)
        .child("matchs")
        .child(match_ID)
        .child('players_selected')
        .child(player._id.toString())
        .set(null);
};

exports.updateStatistic_firebase = function(player, match_ID, coach_ID, stat) {

    ref
        .child(coach_ID)
        .child("matchs")
        .child(match_ID)
        .child('players_selected')
        .child(player._id.toString())
        .child('statistics')
        .update(stat);

};

exports.switchPosition_firebase = (fstPlayerId, sndPlayerId, matchId, coachId) => {


    let refMatch = ref
        .child(coachId.toString())
        .child("matchs")
        .child(matchId.toString());

    let refPlayerSelected = refMatch.child('players_selected');

    let refPlayerNoSelected = refMatch.child('players_no_selected');

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
        .child("matchs")
        .child(matchId.toString());

    let refPlayerSelected = refMatch.child('players_selected').remove();

    let refPlayerNoSelected = refMatch.child('players_no_selected').remove();


};

exports.removeMatch_firebase = (coachId, matchId) => {
    let refMatch = ref
        .child(coachId.toString())
        .child("matchs")
        .child(matchId.toString()).set(null);
};

exports.updateStatMatch_firebase = (coachId, matchId, stat) => {

    let refMatch = ref
        .child(coachId.toString())
        .child("matchs")
        .child(matchId.toString())
        .child("statistics");

    refMatch.update(stat);
}
