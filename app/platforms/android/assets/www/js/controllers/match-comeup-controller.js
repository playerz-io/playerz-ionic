'use strict'

angular.module('starter.controller.match-comeup', [])
    .controller('MatchComeUpCtrl', function(MatchService, $scope, StorageService) {

        let self = this;

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        self.showDelete = false;

        self.saveMatchID = function(match_id) {
            StorageService.addStorageMatchId(match_id);
        };

        self.getMatchComeUp = function() {
            MatchService.getMatchComeUp()
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
                    self.getMatchComeUp();
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getMatchComeUp();


    });
