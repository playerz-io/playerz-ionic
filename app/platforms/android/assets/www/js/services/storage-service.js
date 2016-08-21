'use strict'

angular.module('starter')
  .service('StorageService', function(API_ENDPOINT, $sessionStorage) {

    let getStorageMatchId = function() {
      return window.localStorage.matchId;
    };

    let addStorageMatchId = function(matchId) {
      window.localStorage.matchId = matchId;
    };

    let addStorageCoachId = function(coachId) {
      window.localStorage.coachId = coachId;
    };

    let getStorageCoachId = function() {
      return window.localStorage.coachId;
    };

    let addStoragePlayerId = (playerId) => {
      window.localStorage.playerId = playerId;
    };

    let getStoragePlayerId = () => window.localStorage.playerId;

    return {
      addStorageMatchId,
      getStorageMatchId,
      addStorageCoachId,
      getStorageCoachId,
      addStoragePlayerId,
      getStoragePlayerId
    }
  });
