'use strict';

angular.module('starter.controller.troop', [])
    .controller('TroopTabCtrl', function($ionicPopup, TeamService, $scope, $timeout) {

        var self = this;

        $scope.player = {
            first_name: '',
            last_name: ''
        };

        self.showPopupPlayer = function() {

            let popup = $ionicPopup.show({
                template: '<div class="list">' +
                    '<label class="item item-input">' +
                    '<input type="text" placeholder="First Name" ng-model="player.first_name">' +
                    '</label>' +
                    '<label class="item item-input">' +
                    '<input type="text" placeholder="Last Name" ng-model="player.last_name">' +
                    '</label>' +
                    '</div>',
                title: 'Ajouter un joueur',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Ajouter</b>',
                    onTap: function(e) {
                        self.addPlayer();
                    }
                }]
            });
        }

        self.addPlayer = function() {
            TeamService.addPlayer($scope.player)
                .success(function(data) {
                    self.getPlayers();
                    console.log(data);
                    $scope.player = {};
                })
                .error(function(data) {
                    console.log(data);
                })

        };

        self.getPlayers = function() {
            TeamService.getPlayers()
                .success(function(data) {
                    console.log(data);
                    self.players = data.players;
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        self.removePlayer = function(id) {
            TeamService.removePlayer(id)
                .success(function(data) {
                    console.log(data);
                    self.getPlayers();
                })
                .error(function(data) {
                    console.log(data);
                })
        }
        self.getPlayers();

    });
