'use strict';

angular.module('starter.controller.troop', [])
    .controller('TroopTabCtrl', function($ionicModal, TeamService, $scope, $timeout) {

        var self = this;

        $scope.player = {
            first_name: '',
            last_name: ''
        };

        $ionicModal.fromTemplateUrl('templates/add-player-modal.html', {
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

        self.addPlayer = function() {
            TeamService.addPlayer($scope.player)
                .success(function(data) {
                    self.getPlayers();
                    console.log(data);
                    $scope.player = {};
                    $scope.modal.hide();
                })
                .error(function(data) {
                    console.log(data);
                })

        };

        self.getPlayers = function() {
            TeamService.getPlayers()
                .success(function(data) {
                    console.log(data);
                    self.players = data.players;
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        self.removePlayer = function(id) {
            TeamService.removePlayer(id)
                .success(function(data) {
                    console.log(data);
                    self.getPlayers();
                })
                .error(function(data) {
                    console.log(data);
                })
        }
        self.getPlayers();

    });
