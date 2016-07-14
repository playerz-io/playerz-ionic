'use strict'
angular.module('starter')
    .service('MatchService', function(API_ENDPOINT, $http, $httpParamSerializerJQLike) {
        let addMatch = function(match) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike(match),
                url: API_ENDPOINT.url + '/match'
            });
        };

        let getMatchs = function() {
            return $http({
                method: 'GET',
                url: API_ENDPOINT.url + '/matchs'
            });
        };

        let getMatchById = function(id) {
            return $http({
                method: 'GET',
                url: API_ENDPOINT.url + '/match' + '/' + id
            });
        };

        let removeMatch = function(id) {
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

        let getTactique = function(tactique) {
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

        let addPlayerSelected = function(player_id, match_id, position) {

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

        let getPlayerSelected = function(match_id) {
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

        let removePlayerSelected = function(player_id, match_id) {
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

        let getPlayerNoSelected = (match_id) => $http.get(API_ENDPOINT.url + '/player_no_selected', {
            params: {
                match_id
            }
        });

        let defaultPosition = (match_id) => $http.post(API_ENDPOINT.url + '/defaultPosition', {
            match_id
        });

        let addOpponentBut = (match_id) => $http.post(API_ENDPOINT.url + '/addOpponentBut', {
            match_id
        });

        let removeAction = (match_id) => $http.post(API_ENDPOINT.url + '/removeAction', {
            match_id
        });

        return {
            addOpponentBut,
            removeAction,
            defaultPosition,
            getPlayerNoSelected,
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
