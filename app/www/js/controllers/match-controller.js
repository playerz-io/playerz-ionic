'use strict';
angular.module('starter.controller.match', [])
    .controller('MatchTabCtrl', function($state, $filter, $ionicPopup, $ionicModal, MatchService, $scope, $timeout, StorageService, $cordovaToast) {

        var self = this;

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        $scope.match = {
            against_team: '',
            place: '',
            type: '',
            date: ''
        };

        $ionicModal.fromTemplateUrl('templates/add-match-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        })

        $scope.openModal = function() {
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        self.addMatch = function() {
            $scope.match.date = new Date($scope.match.date);
            $scope.match.against_team = $filter('uppercase')($scope.match.against_team);
            MatchService.addMatch($scope.match)
                .success(function(data) {
                    console.log(data);
                    $cordovaToast.showShortBottom(data.msg);
                    $scope.match = {};
                    $scope.modal.hide();

                })
                .error(function(data) {
                    console.log(data);
                    let alertPopup = $ionicPopup.alert({
                        title: 'Erreur',
                        template: data.msg
                    });
                });
        };

        self.goMatchComeUp = () => {
            $state.go('match-comeup');
        }

    });
