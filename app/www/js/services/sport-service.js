'use strict'

angular.module('starter')
    .service('SportService', function(API_ENDPOINT, $http, $httpParamSerializerJQLike) {


        let getSports = () => $http.get(`${API_ENDPOINT.url}/sports`);
        return {
            getSports
        }
    });
