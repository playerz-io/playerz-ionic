'use strict'

angular.module('starter.controller.stat-end-match', [])
    .controller('StatEndMatchCtrl', function(MatchService, $scope, StorageService, $stateParams) {


        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        let self = this;

        self.matchId = StorageService.getStorage();
        self.totalStat = function() {
            MatchService.totalStat(self.matchId)
                .success(function(data) {
                  console.log(data);
                  self.statistics = data.match_statistics;
                })
                .error(function(data) {
                    console.log(data);
                });
        }

        self.totalStat();
    });
