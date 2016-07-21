'use strict'
angular.module('starter')
    .service('ProfileService', function(API_ENDPOINT, $http, $httpParamSerializerJQLike) {

        let getCoach = function() {
            return $http({
                method: 'GET',
                url: API_ENDPOINT.url + '/coach'
            });
        };

        let getCoachById = () =>
            $http.get(`${API_ENDPOINT.url}/coach_by_id`);


        let updateCoach = (data) =>
             $http.put(`${API_ENDPOINT.url}/coach`,
                data);


        return {
            getCoach,
            getCoachById,
            updateCoach
        }
    });
