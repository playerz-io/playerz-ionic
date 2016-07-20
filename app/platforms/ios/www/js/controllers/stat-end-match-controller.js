'use strict'

angular.module('starter.controller.stat-end-match', [])
    .controller('StatEndMatchCtrl', function(MatchService, $scope, StorageService, $stateParams) {


        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        let self = this;

        self.showDelete = false;
        self.matchId = StorageService.getStorageMatchId();
        self.getMatchStatistics = function() {
            MatchService.getMatchStatistics(self.matchId)
                .success(function(data) {
                    console.log(data);
                    self.statistics = data.statistics;
                })
                .error(function(data) {
                    console.log(data);
                });
        }

        self.getMatchStatistics();
    });
