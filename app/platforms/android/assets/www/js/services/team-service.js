'use strict'

angular.module('starter')
  .service('TeamService', function($q, $http, API_ENDPOINT, $rootScope, $httpParamSerializerJQLike) {

    let addTeam = function(team) {
      return $http({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: $httpParamSerializerJQLike(team),
        url: API_ENDPOINT.url + '/team'
      });
    };

    let addPlayer = function(player) {

      return $http({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: $httpParamSerializerJQLike(player),
        url: API_ENDPOINT.url + '/player'
      });
    };

    let getPlayers = function() {

      return $http({
        method: 'GET',
        url: API_ENDPOINT.url + '/players'
      });
    };

    let removePlayer = function(id) {
      return $http({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: $httpParamSerializerJQLike({
          _id: id
        }),
        url: API_ENDPOINT.url + '/player'
      });
    };

    let getPlayerById = function(id) {
      return $http({
        method: 'GET',
        url: API_ENDPOINT.url + '/player' + '/' + id
      })
    };

    let addFormation = function(formation, id) {
      return $http({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: $httpParamSerializerJQLike({
          formation: formation,
          id: id
        }),
        url: API_ENDPOINT.url + '/formation'
      });
    };

    let nameTeam = function(idCoach){
      return $http({
          method: 'GET',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          params: {
              coach_id: idCoach
          },
          url: API_ENDPOINT.url + '/nameTeam'
      });
    };

    return {

      addTeam,
      addPlayer,
      getPlayers,
      getPlayerById,
      removePlayer,
      addFormation,
      nameTeam

    }

  });
