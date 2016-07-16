'use strict';

angular.module('starter')
  .service('FireService', function(FIREBASE_URI, $firebaseArray, $firebaseObject) {

    let mainRef = new Firebase(FIREBASE_URI + 'coaches');

    return {

      refPlayerSelected: function(matchId, coachId) {
        let refMatchId = mainRef
          .child(coachId)
          .child("matchs")
          .child(matchId)
          .child('players_selected');


        return $firebaseArray(refMatchId);
      },

      refPlayerNoSelected: function(matchId, coachId) {
        let refMatchId = mainRef
          .child(coachId)
          .child("matchs")
          .child(matchId)
          .child('players_no_selected');

        return $firebaseArray(refMatchId);
      },

      refStatMatch: (matchId, coachId) => {
          let refStatMatch = mainRef
            .child(coachId)
            .child("matchs")
            .child(matchId)
            .child('statistics');

            return $firebaseArray(refStatMatch);
      },

      refPlayerSelectedStat: (matchId, coachId, playerId) => {
        let refPlayerStat = mainRef
          .child(coachId)
          .child("matchs")
          .child(matchId)
          .child('players_selected')
          .child(playerId);

          return $firebaseObject(refPlayerStat);
      },

      refPlayer: function(ref) {
        return $firebaseArray(ref);
      }
    }
  });
