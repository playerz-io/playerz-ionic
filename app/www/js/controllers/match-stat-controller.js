'use strict'

angular.module('starter.controller.match-stat', [])
    .controller('MatchStatCtrl', function(TeamService, MatchService, StorageService, PlayerService, FireService, $state, $ionicPopup) {

        let self = this;

        self.coachId = StorageService.getStorageCoachId();
        self.matchId = StorageService.getStorageMatchId();

        let refMatch = FireService.refMatch(self.matchId, self.coachId);
        self.playerSelected = FireService.refPlayer(refMatch);
        self.noSeleted = FireService.refMatchNoSelected(self.matchId, self.coachId);
        self.playersNoSelected = FireService.refPlayer(self.noSeleted);

        self.showCountdownPopup = () => {
            let popup = $ionicPopup.confirm({
                title: 'Chronomètre',
                template: 'En appuyant sur ok le chronomètre va démarrer'
            });
            popup.then((res) => {
                if (res) {
                    console.log('ok');
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
            console.log(player.$id.toString());
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
            PlayerService.countMainAction(self.matchId, action)
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

        self.getMatch();
        self.showCountdownPopup();

    });
