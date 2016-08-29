'use strict'

angular.module('starter.controller.match-stat', [])
    .controller('MatchStatCtrl', function(TeamService, MatchService, $scope, $timeout, StorageService, PlayerService, FireService, $state, $ionicPopup, $interval, $ionicModal, $cordovaToast, $ionicHistory, $ionicLoading) {

        let self = this;

        self.coachId = StorageService.getStorageCoachId();
        self.matchId = StorageService.getStorageMatchId();
        self.playerSelected = FireService.refPlayerSelected(self.matchId, self.coachId);
        self.playersNoSelected = FireService.refPlayerNoSelected(self.matchId, self.coachId);
        self.actions = FireService.getArrayActions(self.matchId, self.coachId);
        self.statMatch = FireService.getStatMatch(self.matchId, self.coachId);
        self.match = FireService.getMatch(self.matchId, self.coachId);
        console.log(self.matchId);
        let counter;
        self.minutes = 0;
        self.seconds = 0;
        self.textSeconds = null;
        self.textMinutes = null;
        self.fullTime = null;
        self.timerRunning = false;
        self.goalkeeper = false;
        self.cardActived = false;
        self.foulsActived = false;

        self.ACTION = {
            _DEFENSIVE: {
                id: 'defensive-action',
                name: 'defensiveAction',
                img: 'img/shield-icon.png',
                img_click: 'img/shield_icon_white.png'
            },
            _ATTEMPTS_ON_TARGET: {
                id: 'attempts-on-target',
                name: 'attemptsOnTarget',
                img: 'img/attempt_on_target_icon.png',
                img_click: 'img/attempt_on_target_icon_white.png'
            },

            _ATTEMPTS_OFF_TARGET: {
                id: 'attempts-off-target',
                name: 'attemptsOffTarget',
                img: 'img/attempt_off_target_icon.png',
                img_click: 'img/attempt_off_target_icon_white.png'
            },

            _BUT: {
                id: 'goal',
                name: 'but',
                img: 'img/goal.png',
                img_click: 'img/goal_white.png'
            },
            _RETRIEVE_BALL: {
                id: 'ball-retrieve',
                name: 'retrieveBalls',
                img: 'img/football-players-on-game.png',
                img_click: 'img/football-players-on-game_white.png'
            },

            _BALL_LOST: {
                name: 'ballLost',
                img: '',
                img_click: ''
            },

            _PASSE_FAILED: {
                name: 'passesFailed',
                img: '',
                img_click: ''
            },

            _DUAL_GOALKEEPER: {
                name: 'dual_goalkeeper',
                img: '',
                img_click: ''
            },

            _SORTIE_AERIENNE: {
                name: 'sorties_aeriennes',
                img: '',
                img_click: ''
            },

            _SAVES: {
                name: 'saves',
                img: '',
                img_click: ''
            },

            _OFF_SIDE: {
                name: 'offSide',
                img: 'img/two-black-flags.png',
                img_click: 'img/two-black-flags_white.png'
            }
        }


        self.showActionsGoalkeeper = () => {
            console.log('goalkeeper');
            self.goalkeeper = !self.goalkeeper;
        }

        self.onTap = (action) => {
            let img = null;
            let img_click = null;
            let element = null;
            let id = null;
            if (action === self.ACTION._DEFENSIVE) {
                img = self.ACTION._DEFENSIVE.img;
                img_click = self.ACTION._DEFENSIVE.img_click;
                id = `#${self.ACTION._DEFENSIVE.id}`;
            } else if (action === self.ACTION._ATTEMPTS_ON_TARGET) {
                img = self.ACTION._ATTEMPTS_ON_TARGET.img;
                img_click = self.ACTION._ATTEMPTS_ON_TARGET.img_click;
                id = `#${self.ACTION._ATTEMPTS_ON_TARGET.id}`;
            }

            element = angular.element(document.querySelector(id));
            element.css({
                'background-image': `url(${img_click})`
            });
            $timeout(() => {
                element.css({
                    'background-image': `url(${img})`
                });
            }, 350);
        }

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

        self.onDropComplete = (index, obj, evt) => {
            //dropped
            console.log(index);
            let droppedId = self.playerSelected[index].$id || self.playerSelected[index]._id;
            //dragged
            let draggedId = obj.$id || obj._id;
            console.log(droppedId, draggedId);
            PlayerService.switchPosition(self.matchId, droppedId, draggedId)
                .success((data) => {
                    console.log(data);
                    $cordovaToast.showShortBottom(data.msg);
                })
                .error((data) => {
                    console.log(data);
                })
        };

        self.timer = () => {
            if (self.timerRunning) {
                if (angular.isDefined(counter)) {
                    console.log('counter is defined stop')
                    $interval.cancel(counter);
                    counter = undefined;
                    self.timerRunning = false;
                }
            } else {
                self.startTimer();
            }
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
            self.timerRunning = true;
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
            if (self.goalkeeper) {
                self.showActionsGoalkeeper();
            }
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
            if (self.goalkeeper) {
                self.showActionsGoalkeeper();
            }

            if (self.cardActived) {
                self.cardActived = !self.cardActived;
            }

            if (self.foulsActived) {
                self.foulsActived = !self.foulsActived;
            }

            PlayerService.countMainAction(self.matchId, action, self.fullTime)
                .success(function(data) {
                    console.log(data);
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        //Change Modal
        $ionicModal.fromTemplateUrl('templates/change-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then((modal) => {
            $scope.modal = modal;
        });

        self.goChange = () => {
            $scope.modal.show();
        };

        self.backToMatch = () => {
            $scope.modal.hide();
        }




        // self.countPercent = function() {
        //     PlayerService.countPercent(self.matchId)
        //         .success(function(data) {
        //             console.log(data);
        //
        //         })
        //         .error(function(data) {
        //             console.log(data);
        //         })
        // }

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

        self.addOpponentBut = function() {
            MatchService.addOpponentBut(self.matchId)
                .success((data) => {
                    console.log(data);
                    self.opponent_but = data.but_opponent;
                })
                .error((data) => {
                    console.log(data);
                })
        };

        self.removeAction = () => {
            MatchService.removeAction(self.matchId)
                .success((data) => {
                    console.log(data);
                    $cordovaToast.showShortBottom(data.msg);
                })
                .error((data) => {
                    console.log(data);
                })
        }

        self.getMatch();
        self.showCountdownPopup();



    });
