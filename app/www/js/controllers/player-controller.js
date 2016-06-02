angular.module('starter.controller.player', [])
    .controller('PlayerCtrl', function(TeamService, $stateParams, $scope) {

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        var self = this;

        self.playerId = $stateParams.playerId;
        self.getPlayer = function() {
            TeamService.getPlayerById(self.playerId)
                .success(function(data) {
                    console.log(data);
                    self.player = data.player;
                })
                .error(function(data) {
                    console.log(data);
                })
        };

        self.getPlayer();
    });
