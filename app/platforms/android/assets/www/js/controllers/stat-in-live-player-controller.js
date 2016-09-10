'use strict'

angular.module('starter.controller.stat-in-live-player', [])
    .controller('StatInLivePlayerCtrl', function(TeamService, MatchService, StorageService, PlayerService, FireService, $scope, $stateParams) {

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        let self = this;

        self.coachId = StorageService.getStorageCoachId();
        self.matchId = StorageService.getStorageMatchId();
        self.playerId = $stateParams.playerId;
        let playerSelectedStat = FireService.refPlayerSelectedStat(self.matchId, self.coachId, self.playerId);
        console.log(playerSelectedStat);
        $scope.data = playerSelectedStat;
        // For three-way data bindings, bind it to the scope instead
        playerSelectedStat.$bindTo($scope, "data");


    });
