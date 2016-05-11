angular.module('starter')
  .service('FireService', function(FIREBASE_URI, $firebaseArray, $firebaseObject) {

    var mainRef = new Firebase(FIREBASE_URI + 'coaches');

    return {

      refMatch: function(matchId, coachId) {
        var refMatchId = mainRef
          .child(coachId)
          .child("matchs")
          .child(matchId)
          .child('players_selected');


        return refMatchId;
      },

      refPlayer: function(ref) {
        return $firebaseArray(ref);
      }
    }
  });
