'use strict'

angular.module('starter.controller.match-comeup', [])
    .controller('MatchComeUpCtrl', function(TeamService, $filter, $ionicPopup, $ionicModal, MatchService, $scope, StorageService, $cordovaToast) {

        let self = this;

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        self.showDelete = false;

        $scope.match = {
            against_team: '',
            place: '',
            type: '',
            date: ''
        };

        self.getNewMatchComeUp = function() {
            MatchService.getMatchComeUp()
                .success(function(data) {
                    console.log(data);
                    self.matchs = data.matchs;
                    $scope.$broadcast('scroll.refreshComplete');
                })
                .error(function(data) {
                    console.log(data);
                });
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

        $scope.addMatch = function() {
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
                    $cordovaToast.showShortBottom(data.msg);
                    console.log(data);
                    self.getMatchComeUp();
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getNameTeam = function() {
            TeamService.nameTeam()
                .success(function(data) {
                    console.log(data);
                    self.nameTeam = data.nameTeam;
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getBillingName = function(match) {
            if (match.place === 'Domicile') {
                self.billingName = `${self.nameTeam} <br /> - <br /> ${match.against_team}`;
            } else {
                self.billingName = `${match.against_team} <br /> - <br /> ${self.nameTeam}`;
            }
            return self.billingName;
        };

        self.getNameTeam();
        self.getMatchComeUp();


    });
