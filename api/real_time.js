'use strict'
//function firebase

let Firebase = require('firebase');
var ref = new Firebase('https://boos.firebaseio.com/coaches');



let checkMatchId = function(match_ID, player) {
    return matchID === player.match_id;
};

exports.addPlayerSelected_firebase = function(player, match_ID, coach_ID) {
    console.log(match_ID);
    console.log(player);

    let refAddPlayer = ref
        .child(coach_ID)
        .child("matchs")
        .child(match_ID)
        .child('players_selected')
        .child(player._id.toString())
        .set({
            id: player._id,
            first_name: player.first_name,
            last_name: player.last_name,
            position: player.position,
            favourite_position: player.favourite_position,
            statistics: {
                assist: player.statistics[0].assist,
                retrieveBalls: player.statistics[0].retrieveBalls,
                foulsSuffered: player.statistics[0].foulsSuffered,
                foulsCommitted: player.statistics[0].foulsCommitted,
                yellowCard: player.statistics[0].yellowCard,
                redCard: player.statistics[0].redCard,
                attemptsOnTarget: player.statistics[0].attemptsOnTarget,
                attemptsOffTarget: player.statistics[0].attemptsOffTarget,
                attempts: player.statistics[0].attempts,
                beforeAssist: player.statistics[0].beforeAssist,
                matchPlayed: player.statistics[0].matchPlayed,
                firstTeamPlayer: player.statistics[0].firstTeamPlayer,
                substitute: player.statistics[0].substitute,
                but: player.statistics[0].but,
                ballLost: player.statistics[0].ballLost,
                ballPlayed: player.statistics[0].ballPlayed,
                passesCompletion: player.statistics[0].passesCompletion,
                defensiveAction: player.statistics[0].defensiveAction,
                relanceCompletion: player.statistics[0].relanceCompletion,
                offSide: player.statistics[0].offSide,
                passesFailed: player.statistics[0].passesFailed,
                crossesFailed: player.statistics[0].crossesFailed,
                saves: player.statistics[0].saves,
                claquettes: player.statistics[0].claquettes,
                sorties_aeriennes: player.statistics[0].sorties_aeriennes,
                clean_sheet: player.statistics[0].clean_sheet
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
        .update(stat);

};
