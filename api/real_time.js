'use strict'
//function firebase

let Firebase = require('firebase');
let ref = new Firebase('https://boos.firebaseio.com/coaches');
let async = require('async');


let checkMatchId = function(match_ID, player) {
    return matchID === player.match_id;
};

exports.addPlayerSelected_firebase = function(player, match_ID, coach_ID) {
    //console.log(match_ID);
    //console.log(player);
    console.log('ok');

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

    //console.log(referenceFstPlayerNo, referenceSndPlayerNo);

    // refPlayerNoSelected.once("value", (snapshot) => {
    //
    //     if (!)
    //         console.log(snapshot.child(fstPlayerId).exists());
    // });

    //console.log(referencePlayerOne, referencePlayerTwo);
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

exports.playersNoSelected_firebase = (matchId, coachId, player) => {
    let refAddPlayer = ref
        .child(coachId)
        .child("matchs")
        .child(matchId)
        .child('players_no_selected')
        .child(player._id.toString())
        .set({
            id: player._id,
            first_name: player.first_name,
            last_name: player.last_name,
            favourite_position: player.favourite_position
        })
}

exports.playersNoSelectedToRemplacant = (matchId, coachId, player) => {

}
