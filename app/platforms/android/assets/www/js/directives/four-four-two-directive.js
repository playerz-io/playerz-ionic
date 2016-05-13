angular.module('starter.directives.fourFourtwo', [])
  .directive('fourFourtwo', function() {

    return {
      templateUrl: 'templates/formation/four-four-two.html',
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: 'MatchStatCtrl',
      controllerAs: 'matchStat',
      scope: {
        playerInfo: '=info',
        isDisableClick: '=click'
      }
    };
  });
