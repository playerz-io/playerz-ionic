angular.module('starter.directives.threeFivetwo', [])
    .directive('threeFivetwo', function() {

        return {
            templateUrl: 'templates/formation/three-five-two.html',
            restrict: 'E',
            scope: {
                playerInfo: '=info',
                drag: '=',
                dropComplete: '&',
                ballPlayed: '&',
                showActionsGoalkeeper: '&',
                goalkeeper: '=',
                actionsGoalkeeper: '&'
            }
        };
    });
