'use strict';
angular.module('starter.controller.match', [])
    .controller('MatchTabCtrl', function($ionicPopup, MatchService, $scope, $timeout, StorageService) {

        var self = this;

        $scope.match = {
            against_team: '',
            place: '',
            type: '',
            date: ''
        };

        self.showPopupMatch = function() {
            let popup = $ionicPopup.show({
                template: '<div class="list">' +
                    '<label class="item item-input">' +
                    '<input type="text" placeholder="Adversaire" ng-model="match.against_team">' +
                    '</label>' +
                    '<label class="item item-input">' +
                    '<input type="text" placeholder="Domicile ou Exterieur" ng-model="match.place">' +
                    '</label>' +
                    '<label class="item item-input">' +
                    '<input type="text" placeholder="Amical Officiel" ng-model="match.type">' +
                    '</label>' +
                    '<label class="item item-input">' +
                    '<span class="input-label">Date</span>' +
                    '<input type="date" ng-model="match.date">' +
                    '</label>' +
                    '</div>',
                title: 'Ajouter un match',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Ajouter</b>',
                    onTap: function(e) {
                        self.addMatch();
                    }
                }]
            });
        }
        self.saveMatchID = function(match_id) {
            StorageService.addStorage(match_id);
        };

        self.addMatch = function() {
            MatchService.addMatch($scope.match)
                .success(function(data) {
                    self.getMatchs();
                    $scope.match = {};

                })
                .error(function(data) {
                    console.log(data);
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
