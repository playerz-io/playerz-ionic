'use strict'

angular.module('starter.controller.match-played', [])
    .controller('MatchPlayedCtrl', function(MatchService, $scope, StorageService) {
        let self = this;

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        self.saveMatchID = function(match_id) {
            StorageService.addStorageMatchId(match_id);
        };

        self.getMatchFinished = function() {
            MatchService.getMatchFinished()
                .success(function(data) {
                    console.log(data);
                    self.matchs = data.matchs;
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.removeMatch = function(id) {
            MatchService.removeMatch(id)
                .success(function(data) {
                    console.log(data);
                    self.getMatchFinished();
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getGlobalStatisticsMatch = () => {
            MatchService.getGlobalStatisticsMatch()
                .success(function(data) {
                    console.log(data);
                    self.statisticsGlobal = data.statisticsGlobal;
                    self.nbrMatchFinished = data.nbrMatchFinished;
                })
                .error(function(data) {
                    console.log(data);
                });
        };
        self.getMatchFinished();
        self.getGlobalStatisticsMatch();


    });
