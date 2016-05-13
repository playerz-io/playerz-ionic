'use strict'

angular.module('starter')
  .service('PlayerService', function(API_ENDPOINT, $http, $httpParamSerializerJQLike) {
    let addPosition = function(player_id, position) {
      return $http({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: $httpParamSerializerJQLike({
          player_id: player_id,
          position: position
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

    let countMainAction = function(match_id, action) {
      return $http({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: $httpParamSerializerJQLike({
          match_id,
          action
        }),
        url: API_ENDPOINT.url + '/action'
      });
    }

    return {
      addPosition,
      updateStatistic,
      addSchema,
      countMainAction
    }
  });
