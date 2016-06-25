'use strict'

angular.module('starter.controller.summary-stat', [])
    .controller('SummaryStatCtrl', function(MatchService, StorageService, PlayerService, FireService, $scope) {

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        let self = this;

        self.coachId = StorageService.getStorageCoachId();
        self.matchId = StorageService.getStorageMatchId();

        let firebaseMatch = FireService.refMatch(self.matchId, self.coachId);

        self.realTimePlayers = FireService.refPlayer(firebaseMatch);
        console.log(self.realTimePlayers);

        self.namesStats = [
            "Min",
            "Ballons joués",
            "Ballons perdus",
            "% de passes réussies",
            "Ballons récupérés",
            "Geste Défensif",
            "% de relance",
            "Fautes Commises",
            "Fautes Subies",
            "Hors-Jeu",
            "Tir",
            "Tir Cadré",
            "Avant Passe Décisive",
            "Passe Décisive",
            "But"
        ];



    });
