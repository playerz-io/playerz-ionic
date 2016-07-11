'use strict';

angular.module('starter')
  .service('FireService', function(FIREBASE_URI, $firebaseArray) {

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

      refPlayer: function(ref) {
        return $firebaseArray(ref);
      }
    }
  });
