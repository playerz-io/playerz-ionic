'use strict';

angular.module('starter.controller.player-statistics', [])
    .controller("PlayerStatCtrl", function(PlayerService, $stateParams, $scope) {

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        let self = this;

        self.matchId = $stateParams.matchId;
        self.playerId = $stateParams.playerId;

        self.getStatisticsMatch = () => {
            PlayerService.getStatisticsMatch(self.playerId, self.matchId)
                .success((data) => {
                    self.stat = data.stat;
                    console.log(data);
                })
                .error((data) => {
                    console.log(data);
                })
        };

        self.getStatisticsMatch();
    });
