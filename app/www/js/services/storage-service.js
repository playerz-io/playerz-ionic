'use strict'

angular.module('starter')
  .service('StorageService', function(API_ENDPOINT, $sessionStorage) {

    let getStorage = function() {
      return window.localStorage.matchId;
    };

    let addStorage = function(matchId) {
      window.localStorage.matchId = matchId;
    };

    let addStorageCoachId = function(coachId) {
      window.localStorage.coachId = coachId;
    };

    let getStorageCoachId = function() {
      return window.localStorage.coachId;
    };

    return {
      addStorage,
      getStorage,
      addStorageCoachId,
      getStorageCoachId
    }
  });
