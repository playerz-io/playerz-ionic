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

      refPlayerNoSelected: (matchId, coachId) => {
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

            return $firebaseObject(refStatMatch);
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

      getArrayActions: (matchId, coachId) => {
        let refActions = mainRef
          .child(coachId)
          .child("matchs")
          .child(matchId)
          .child('actions');

          let actions = $firebaseArray(refActions);

          let query = refActions.limitToLast(3);

          return $firebaseArray(query);

      },

      getStatMatch: (matchId, coachId) => {
        let refStat = mainRef
          .child(coachId)
          .child("matchs")
          .child(matchId)
          .child('statistics');

          return $firebaseObject(refStat);
      },

      getMatch: (matchId, coachId) => {
        let match = mainRef
          .child(coachId)
          .child("matchs")
          .child(matchId)

          return $firebaseObject(match);
      },

      refPlayer: function(ref) {
        return $firebaseArray(ref);
      }
    }
  });
