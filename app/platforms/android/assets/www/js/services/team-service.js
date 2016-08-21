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

        let nameTeam = function(idCoach) {
            return $http.get(API_ENDPOINT.url + '/nameTeam');
        };

        let getNameClub = () => $http.get(`${API_ENDPOINT.url}/getNameClub`);

        let getCategories = () => $http.get(`${API_ENDPOINT.url}/categories_football`);
        let getFrenchDivisionFootball = () => $http.get(`${API_ENDPOINT.url}/french_division_football`);


        return {
            getFrenchDivisionFootball,
            getCategories,
            getNameClub,
            addTeam,
            addPlayer,
            getPlayers,
            getPlayerById,
            removePlayer,
            addFormation,
            nameTeam

        }

    });
