'use strict'

angular.module('starter.controller.match-stat', [])
    .controller('MatchStatCtrl', function(TeamService, MatchService, StorageService, PlayerService, FireService, $state, $ionicPopup) {

        const NBR_PLAYER_SWITCHED = 2;
        let self = this;
        self.disable = true;
        self.coachId = StorageService.getStorageCoachId();
        self.matchId = StorageService.getStorageMatchId();
        self.playerSelected_firebase = FireService.refPlayer(FireService.refMatch(self.matchId, self.coachId));
        let refMatch = FireService.refMatch(StorageService.getStorageMatchId(), self.coachId);
          self.formation = '4-4-2';
        self.showDelete = false;
        //define if player is selected by user
        // self.selected = -1;
        // self.switched = false;
        // // array that should contains two player switched
        // let playerSwitched = [];

        self.onDropComplete = (index, obj, evt) => {
            //dropped
            console.log(index);
            let droppedId = self.playerSelected_firebase[index].$id || self.playerSelected_firebase[index]._id;
            //dragged
            console.log(obj);
            let draggedId = obj.$id || obj._id;

            PlayerService.switchPosition(self.matchId, droppedId, draggedId)
                .success((data) => {
                    console.log(data);
                })
                .error((data) => {
                    console.log(data);
                })

        };

        //switched position of two player
        // params index allow to highlight only the player selected
        // self.switchedPlayer = (index, player) => {
        //     self.selected = index;
        //
        //     if (!self.switched) {
        //         playerSwitched.push(player);
        //         self.switched = true;
        //
        //     } else {
        //         playerSwitched.push(player);
        //         console.log(playerSwitched);
        //         //check if playerSelected lenght equals 2
        //         if (playerSwitched.length === NBR_PLAYER_SWITCHED) {
        //             let idFstPlayer = playerSwitched[0].$id;
        //             let idSndPlayer = playerSwitched[1].$id;
        //             console.log(idFstPlayer, idSndPlayer);
        //             PlayerService.switchPosition(self.matchId, idFstPlayer, idSndPlayer)
        //                 .success((data) => {
        //                     console.log(data);
        //                 })
        //                 .error((data) => {
        //                     console.log(data);
        //                 })
        //         }
        //
        //         playerSwitched = [];
        //         self.switched = false;
        //         self.selected = -1;
        //     }
        // };


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

        //update statistic of player, set the stat in params stat
        self.updateStatistic = function(player_id, stat) {
            PlayerService.updateStatistic(player_id, self.matchId, stat)
                .success(function(data) {
                    console.log(data);
                    // data of match
                    self.playerSelected = data.playerSelected;

                })
                .error(function(data) {
                    console.log(data);
                })
        };

        // get Match with match id
        self.getMatch = function() {
            MatchService.getMatchById(self.matchId)
                .success(function(data) {
                    console.log(data);
                    // data of match
                    self.match = data.match;
                    self.coach_id = data.coach_id;
                    console.log(self.match);
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        // get player selected of match with match id
        // self.getPlayerSelected = function() {
        //     MatchService.getPlayerSelected(self.matchId)
        //         .success(function(data) {
        //             console.log(data.playerSelected);
        //             // data of player
        //             self.playerSelected = data.playerSelected;
        //         })
        //         .error(function(data) {
        //             console.log(data);
        //         })
        // };

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

        //change the formation
        self.addFormation = function() {
            //console.log(formation);
            TeamService.addFormation(self.formation, self.matchId)
                .success(function(data) {
                    self.getTactique();
                    console.log(data);
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        // return posts of formation
        self.getTactique = function() {
            MatchService.getTactique(self.formation)
                .success(function(data) {
                    console.log(data);
                    self.post = data.tactique;
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getPlayerNoSelected = () => {
            MatchService.getPlayerNoSelected(self.matchId)
                .success((data) => {
                    self.playersNoSelected = data.players;
                    console.log(data);
                })
                .error((data) => {

                })
        };

        //remove player to the selection of current match
        self.removePlayerSelected = function(player_id, player) {
            MatchService.removePlayerSelected(player_id, self.matchId)
                .success(function(data) {
                    console.log(data);
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getPlayerNoSelected();
        MatchService.defaultPosition(self.matchId);
        self.playerSelected = FireService.refPlayer(refMatch);
        //        self.getMatch();
        //playerSelected for data in real time

    });
