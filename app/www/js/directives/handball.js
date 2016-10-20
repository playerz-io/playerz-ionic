angular.module('starter.directives.handball', [])
    .directive('handball', function() {

        return {
            templateUrl: 'templates/formation/handball.html',
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
