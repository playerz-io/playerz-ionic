'use strict'

angular.module('starter.controller.stat-in-live', [])
    .controller('StatInLiveCtrl', function(TeamService, MatchService, StorageService, PlayerService, $scope, FireService, $state, $ionicPopup, $interval) {

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        let self = this;

        self.coachId = StorageService.getStorageCoachId();
        self.matchId = StorageService.getStorageMatchId();
        self.refStatMatch = FireService.refStatMatch(self.matchId, self.coachId);
        console.log(self.refStatMatch);
        self.playerSelected = FireService.refPlayerSelected(self.matchId, self.coachId);
        console.log(self.playerSelected);

        self.goStat = (playerId) => {
            $state.go('stat-in-live-player', {
                playerId
            });
        }

    });
