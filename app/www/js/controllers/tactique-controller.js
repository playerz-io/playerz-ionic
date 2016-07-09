'use strict';
angular.module('starter.controller.tactique', [])
    .controller('TactiqueCtrl', function($ionicPopup, $stateParams, TeamService, MatchService, PlayerService, FireService, $localStorage, StorageService, $scope) {

        var self = this;

        self.nameTeam = null;
        self.opponent = null;
        self.place = null;
        self.billingName = null;
        self.showDelete = false;

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        self.matchId = StorageService.getStorageMatchId();
        self.coachId = StorageService.getStorageCoachId();
        var refMatch = FireService.refMatch(self.matchId, self.coachId);
        self.playerSelected_firebase = FireService.refMatch(self.matchId, self.coachId);
        self.formation = '4-4-2';

        self.getPlayerNoSelected = () => {
            MatchService.getPlayerNoSelected(self.matchId)
                .success((data) => {
                    console.log(data);

                })
                .error((data) => {

                })
        };

        self.defaultPosition = () => {
            MatchService.defaultPosition(self.matchId)
                .success((data) => {
                    console.log(data);
                    self.playerSelected = FireService.refPlayer(refMatch);
                })
                .error((data) => {
                    console.log(data);
                })

        };



        self.onDropComplete = (index, obj, evt) => {
            //dropped
            console.log(index);
            let droppedId = self.playerSelected[index].$id || self.playerSelected_firebase[index]._id;
            //dragged
            let draggedId = obj.$id || obj._id;
            console.log(droppedId, draggedId);
            PlayerService.switchPosition(self.matchId, droppedId, draggedId)
                .success((data) => {
                    console.log(data);
                })
                .error((data) => {
                    console.log(data);
                })

        };


        self.noSeleted = FireService.refMatchNoSelected(self.matchId, self.coachId);
        self.playersNoSelected = FireService.refPlayer(self.noSeleted);
        console.log(self.playersNoSelected);


        // self.getPlayers = function() {
        //     TeamService.getPlayers()
        //         .success(function(data) {
        //             console.log(data);
        //             self.players = data.players;
        //
        //         })
        //         .error(function() {
        //             console.log(data);
        //         });
        // };

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

        //add player to the selection of current match
        // self.addPlayerSelected = function(player_id, position) {
        //     console.log(player_id);
        //     MatchService.addPlayerSelected(player_id, self.matchId, position)
        //         .success(function(data) {
        //             console.log(data);
        //             if (!data.success) {
        //                 $ionicPopup.alert({
        //                     title: 'Erreur',
        //                     template: data.msg
        //                 })
        //             }
        //
        //         })
        //         .error(function(data) {
        //             console.log(data);
        //         });
        // };

        //remove player to the selection of current match
        // self.removePlayerSelected = function(player_id, player) {
        //     MatchService.removePlayerSelected(player_id, self.matchId)
        //         .success(function(data) {
        //             console.log(data);
        //         })
        //         .error(function(data) {
        //             console.log(data);
        //         });
        // };


        // self.playerSelected = FireService.refPlayer(refMatch);
        // console.log(self.playerSelected);
        // console.log('self.playerSelected :' + self.matchId);

        //add position to player
        // self.addPosition = function(player_id, position) {
        //     PlayerService.addPosition(player_id, position, self.matchId)
        //         .success(function(data) {
        //             console.log(data);
        //         })
        //         .error(function(data) {
        //             console.log(data);
        //         });
        // };

        self.getMatch = function() {
            MatchService.getMatchById(self.matchId)
                .success(function(data) {
                    console.log(data);
                    self.opponent = data.match.against_team;
                    self.place = data.match.place;
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getNameTeam = function() {
            TeamService.nameTeam(self.coachId)
                .success(function(data) {
                    console.log(data);
                    self.nameTeam = data.nameTeam;
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getBillingName = function() {

                if (self.place === 'Domicile') {
                    self.billingName = self.nameTeam + ' - ' + self.opponent;
                } else {
                    self.billingName = self.opponent + ' - ' + self.nameTeam;
                }

                return self.billingName;
            }
            //call add formation here for get position as soons as
            // tactique page is loaded
            //self.addFormation();
            //  self.getPlayers();
            //  self.getPlayerNoSelected();
            // TODO: faire choisir une formation vie un modal ou une popup
        self.addFormation();
        self.defaultPosition();
        self.getMatch();
        self.getNameTeam();


    });
