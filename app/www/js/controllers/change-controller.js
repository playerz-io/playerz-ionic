angular.module('starter.controller.change', [])
    .controller('ChangeCtrl', function(MatchService, StorageService, FireService, PlayerService, $scope) {

        var self = this;

        self.matchId = StorageService.getStorageMatchId();
        self.coachId = StorageService.getStorageCoachId();
        self.playerSelected = FireService.refPlayerSelected(self.matchId, self.coachId);

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

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
                })
                .error((data) => {
                    console.log(data);
                })
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
                })
        };

        self.getMatch = function() {
            MatchService.getMatchById(self.matchId)
                .success(function(data) {
                    console.log(data);
                    // data of match
                    self.formation = data.match.formation;
                    self.match = data.match;
                    self.getTactique();
                    //self.coach_id = data.coach_id;
                    //console.log(self.match);
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        //add position to player
        self.addPosition = function(player_id, position) {
            PlayerService.addPosition(player_id, position, self.matchId)
                .success(function(data) {
                    console.log(data);
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        self.getMatch();


    });
