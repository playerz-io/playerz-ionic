'use strict'

angular.module('starter.controller.match-stat', [])
    .controller('MatchStatCtrl', function(TeamService, MatchService, StorageService, PlayerService, FireService, $state, $ionicPopup, $interval) {

        let self = this;

        self.coachId = StorageService.getStorageCoachId();
        self.matchId = StorageService.getStorageMatchId();
        let refMatch = FireService.refMatch(self.matchId, self.coachId);
        self.playerSelected = FireService.refPlayer(refMatch);
        self.noSeleted = FireService.refMatchNoSelected(self.matchId, self.coachId);
        self.playersNoSelected = FireService.refPlayer(self.noSeleted);
        let counter;
        self.minutes = 0;
        self.seconds = 0;
        self.textSeconds = null;
        self.textMinutes = null;
        self.fullTime = null;

        self.time = () => {
            self.seconds++;
            if (self.seconds > 59) {
                self.seconds = 0;
                self.minutes++;
            }

            self.textMinutes = self.minutes < 10 ? '0' + self.minutes : self.minutes;
            self.textSeconds = self.seconds < 10 ? '0' + self.seconds : self.seconds;
            self.fullTime = self.textMinutes + ':' + self.textSeconds;

        }

        self.stopTimer = () => {
            console.log('OK');
            if (angular.isDefined(counter)) {
                console.log('counter is defined stop')
                $interval.cancel(counter);
                counter = undefined;
            }
        };

        self.startTimer = () => {
            if (angular.isDefined(counter)) {
                console.log('counter is defined')
                return;
            }
            counter = $interval(self.time, 1000);
        };

        self.showCountdownPopup = () => {
            let popup = $ionicPopup.confirm({
                title: 'Chronomètre',
                template: 'En appuyant sur ok le chronomètre va démarrer'
            });
            popup.then((res) => {
                if (res) {
                    console.log('ok');
                    self.startTimer();
                } else {
                    $state.go('tactique');
                }
            })
        };

        self.showConfirmEndMatchPopup = function() {
            let popup = $ionicPopup.confirm({
                title: 'Fin du match',
                template: 'Etes-vous sûr de vouloir terminer le match ?'
            });
            popup.then(function(res) {
                if (res) {
                    self.countPercent();
                } else {

                }
            });
        };

        //  update statistic of player, set the stat in params stat
        self.updateStatistic = function(player_id, stat) {
            PlayerService.updateStatistic(player_id, self.matchId, stat)
                .success(function(data) {
                    console.log(data);
                    // data of match
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        //count ball touched
        self.countBallPlayed = function(player) {
            self.updateStatistic(player.$id, "ballPlayed");
            PlayerService.addSchema(self.matchId, player.$id.toString())
                .success(function(data) {
                    console.log(data);
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        self.countMainAction = function(action) {
            console.log(action)
            PlayerService.countMainAction(self.matchId, action, self.fullTime)
                .success(function(data) {
                    console.log(data);
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        self.countPercent = function() {
            PlayerService.countPercent(self.matchId)
                .success(function(data) {
                    console.log(data);
                    $state.go("summary-stat");
                })
                .error(function(data) {
                    console.log(data);
                })
        }

        self.getMatch = function() {
            MatchService.getMatchById(self.matchId)
                .success(function(data) {
                    console.log(data);
                    self.formation = data.match.formation;
                    console.log(self.formation);
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.addOpponentBut = function(){
          MatchService.addOpponentBut(self.matchId)
          .success((data) => {
            console.log(data);
            self.opponent_but = data.but_opponent;
          })
          .error((data) => {
            console.log(data);
          })
        }

        self.getMatch();
        self.showCountdownPopup();

    });
