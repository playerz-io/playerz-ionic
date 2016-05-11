angular.module('starter.directives.fourThreethree', [])
    .directive('fourThreethree', function(){

	return {
	    templateUrl: 'templates/formation/four-three-three.html',
	    restrict: 'E',
	    replace: true,
	    transclude: true
	};
});
