'use strict'
angular.module('starter')
    .service('MatchService', function(API_ENDPOINT, $http, $httpParamSerializerJQLike) {
        var addMatch = function(match) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike(match),
                url: API_ENDPOINT.url + '/match'
            });
        };

        var getMatchs = function() {
            return $http({
                method: 'GET',
                url: API_ENDPOINT.url + '/matchs'
            });
        };

        var getMatchById = function(id) {
            return $http({
                method: 'GET',
                url: API_ENDPOINT.url + '/match' + '/' + id
            });
        };

        var removeMatch = function(id) {
            return $http({
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike({
                    id: id
                }),
                url: API_ENDPOINT.url + '/match'
            });
        };

        var getTactique = function(tactique) {
            return $http({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: {
                    tactique: tactique
                },
                url: API_ENDPOINT.url + '/tactique'
            });
        };

        var addPlayerSelected = function(player_id, match_id, position) {

            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike({
                    match_id,
                    player_id,
                    position
                }),
                url: API_ENDPOINT.url + '/player_selected'

            });
        };

        var getPlayerSelected = function(match_id) {
            return $http({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: {
                    match_id: match_id
                },
                url: API_ENDPOINT.url + '/player_selected'
            });
        };

        var removePlayerSelected = function(player_id, match_id) {
            return $http({
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike({
                    match_id: match_id,
                    player_id: player_id
                }),
                url: API_ENDPOINT.url + '/player_selected'

            });

        };

        let getMatchFinished = function() {
            return $http.get(API_ENDPOINT.url + '/match_finished');
        };

        let getMatchComeUp = function() {
            return $http.get(API_ENDPOINT.url + '/match_comeup');
        };

        let totalStat = function(match_id) {
          return $http({
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
              },
              data: $httpParamSerializerJQLike({
                  match_id,
              }),
              url: API_ENDPOINT.url + '/totalStat'

          });
        }

        return {
            totalStat,
            addMatch,
            getMatchs,
            getMatchById,
            removeMatch,
            getTactique,
            addPlayerSelected,
            getPlayerSelected,
            removePlayerSelected,
            getMatchFinished,
            getMatchComeUp
        }
    });
