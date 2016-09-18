'use strict';
angular.module('starter.controller.menu-match', [])
    .controller('MenuMatchCtrl', function($state, $filter, $ionicPopup, $ionicModal, MatchService, $scope, $timeout, StorageService, $cordovaToast) {

        var self = this;

        self.matchId = StorageService.getStorageMatchId();

        console.log(self.matchId);

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        let putMatchFinished = () => {
            MatchService.putMatchFinished(self.matchId)
                .success((data) => {
                    console.log(data);
                })
                .error((data) => {
                    console.log(data);
                })
        };

        self.showConfirmEndMatchPopup = function() {
            console.log('show popup');
            let popup = $ionicPopup.confirm({
                title: 'Fin du match',
                template: 'Etes-vous sûr de vouloir terminer le match ?'
            });
            popup.then(function(res) {
                if (res) {
                    putMatchFinished();
                    $state.go("summary-stat");
                } else {

                }
            });
        };

    });
