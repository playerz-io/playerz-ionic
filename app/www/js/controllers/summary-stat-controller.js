'use strict'

angular.module('starter.controller.summary-stat', [])
    .controller('SummaryStatCtrl', function(MatchService, StorageService, PlayerService, FireService, $scope) {

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        let self = this;

        self.coachId = StorageService.getStorageCoachId();
        self.matchId = StorageService.getStorageMatchId();

    });
