'use strict'
angular.module('starter.controller.player', [])
    .controller('PlayerCtrl', function(TeamService, $stateParams, $scope, PlayerService, StorageService, $state) {

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        var self = this;

        self.playerId = StorageService.getStoragePlayerId();

        self.getPlayer = function() {

            TeamService.getPlayerById(self.playerId)

            .success(function(data) {
                    console.log(data);
                    self.player = data.player;
                })
                .error(function(data) {
                    console.log(data);
                })
        };


        self.getMatchPlayed = () => {

            PlayerService.getMatchPlayed(self.playerId)
                .success((data) => {
                    self.matchPlayed = data.matchs;
                    console.log(data);
                })
                .error((data) => {
                    console.log(data);
                })
        }

        self.goPlayerStat = (matchId) => {
          StorageService.addStorageMatchId(matchId);
          $state.go('player-statistics', { matchId, playerId: self.playerId });
        };

        self.getPlayer();
        self.getMatchPlayed();
    });
