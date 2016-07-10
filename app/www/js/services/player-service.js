'use strict';

angular.module('starter')
    .service('PlayerService', function(API_ENDPOINT, $http, $httpParamSerializerJQLike) {
        let addPosition = function(player_id, position, match_id) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike({
                    player_id,
                    position,
                    match_id
                }),
                url: API_ENDPOINT.url + '/position'
            });
        };

        let updateStatistic = function(player_id, match_id, stat) {

            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike({
                    player_id,
                    match_id,
                    stat
                }),
                url: API_ENDPOINT.url + '/statistic'
            });

        };

        let addSchema = function(match_id, data_schema) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike({
                    match_id,
                    data_schema
                }),
                url: API_ENDPOINT.url + '/schema'
            });
        };

        let countMainAction = function(match_id, action, time) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike({
                    match_id,
                    action,
                    time
                }),
                url: API_ENDPOINT.url + '/action'
            });
        };

        let percentPass = function(idMatch, idPlayer) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: $httpParamSerializerJQLike({
                    idMatch,
                    idPlayer
                }),
                url: API_ENDPOINT.url + '/percentPass'

            });
        };

        let countPercent = function(idMatch) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: $httpParamSerializerJQLike({
                    idMatch
                }),
                url: API_ENDPOINT.url + '/countPercent'

            });
        };

        let getMatchPlayed = (player_id) =>
            $http.get(`${API_ENDPOINT.url}/getMatchPlayed`, {
                params: {
                    player_id
                }
            });

        let getStatisticsMatch = (player_id, match_id) =>
            $http.get(`${API_ENDPOINT.url}/getStatisticsMatch`, {
                params: {
                    player_id,
                    match_id
                }
            });

        let switchPosition = (match_id, player_id_one, player_id_two) =>
            $http.post(`${API_ENDPOINT.url}/switchPosition`, {
                match_id,
                player_id_one,
                player_id_two
            });
        return {
            switchPosition,
            getMatchPlayed,
            getStatisticsMatch,
            addPosition,
            updateStatistic,
            addSchema,
            countMainAction,
            percentPass,
            countPercent
        }
    });
