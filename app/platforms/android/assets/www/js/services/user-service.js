'use strict'

angular.module('starter')
    .service('UserService', function(API_ENDPOINT, $http, $httpParamSerializerJQLike) {

        let changePassword = (settingsPassword) =>
            $http.post(`${API_ENDPOINT.url}/changePassword`, settingsPassword);

        return {
          changePassword
        }
    });
