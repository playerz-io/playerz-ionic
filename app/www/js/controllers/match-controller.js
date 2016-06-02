'use strict';
angular.module('starter.controller.match', [])
    .controller('MatchTabCtrl', function($ionicPopup, $ionicModal, MatchService, $scope, $timeout, StorageService) {

        var self = this;

        $scope.match = {
            against_team: '',
            place: '',
            type: '',
            date: ''
        };

        $ionicModal.fromTemplateUrl('templates/add-match-modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal){
          $scope.modal = modal;
        })

        $scope.openModal = function(){
          $scope.modal.show();
        };

        $scope.closeModal = function(){
          $scope.modal.hide();
        };

        self.saveMatchID = function(match_id) {
            StorageService.addStorage(match_id);
        };

        self.addMatch = function() {
            MatchService.addMatch($scope.match)
                .success(function(data) {
                    self.getMatchs();
                    $scope.match = {};
                    $scope.modal.hide();

                })
                .error(function(data) {
                    console.log(data);
                    let alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: data.msg
                    });
                })
        };

        self.getMatchs = function() {
            MatchService.getMatchs()
                .success(function(data) {
                    self.matchs = data.matchs;
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        self.removeMatch = function(id) {
            MatchService.removeMatch(id)
                .success(function(data) {
                    console.log(data);
                    self.getMatchs();
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        self.getMatchs();

    });
