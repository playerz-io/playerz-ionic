angular.module('starter')
    .service('ProfileService', function(API_ENDPOINT, $http){
	
	var getCoach = function(){
	    return $http({
		method: 'GET',
		url: API_ENDPOINT.url + '/coach'
	    });
	};
	
	return {
	    getCoach: getCoach
	}
    })
