'use strict'

angular.module('starter.controller.match-played', [])
    .controller('MatchPlayedCtrl', function(TeamService, MatchService, $scope, StorageService, $state, $ionicPopup) {
        let self = this;

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        self.saveMatchID = function(match_id) {
            StorageService.addStorageMatchId(match_id);

            $state.go('stat-end-match', {
                matchId: match_id
            });
        };

        self.getMatchFinished = () => {
            MatchService.getMatchFinished()
                .success(function(data) {
                    console.log(data);
                    self.matchs = data.matchs;
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getNewMatchFinished = () => {
            MatchService.getMatchFinished()
                .success(function(data) {
                    console.log(data);
                    self.matchs = data.matchs;
                    self.getGlobalStatisticsMatch();
                    $scope.$broadcast('scroll.refreshComplete');
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
                    self.ball = [self.statisticsGlobal.totalBallLost, self.statisticsGlobal.totalBallPlayed];
                    //self.ballChart();
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

        self.popupRemoveMatch = (match) => {
            $ionicPopup.confirm({
                cssClass: 'popup-center-text',
                title: 'Suppression',
                template: `Etes-vous sûre de vouloir supprimer
              ${self.getBillingName(match)} ?`
            }).then((res) => {
                self.removeMatch(match._id);
            })
        };

        self.getNameTeam();


        self.getMatchFinished();
        self.getGlobalStatisticsMatch();


    });
