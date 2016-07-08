angular.module('starter.directives.fourFourtwo', [])
  .directive('fourFourtwo', function() {

    return {
      templateUrl: 'templates/formation/four-four-two.html',
      restrict: 'E',
      scope: {
        playerInfo: '=info',
        isDisableClick: '=click',
        dropComplete: '&'
      }
    };
  });
