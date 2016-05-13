angular.module('starter.controller.profile', [])

    .controller('ProfileCtrl', function($state, $http, ProfileService, AuthService){

	var self = this;
	var dataProfile;
	ProfileService.getCoach()
	    .success(function(data){
		dataProfile = data.coach;
		self.last_name = dataProfile.last_name;
		self.first_name = dataProfile.first_name;
	    })
	    .error(function(data){
		console.log(data);
	    })


	self.logout = function(){
	    AuthService.logout();
	    $state.go('login');
	}
	// var profile = this;

	
	// var facebook = function(response){
	//     $http({
	// 	method: 'POST',
	// 	headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	// 	data: $httpParamSerializerJQLike({ last_name: response.last_name, 
	// 					   first_name: response.first_name}),
	// 	url: 'http://localhost:8080/api/facebook'
	//     })
	// 	.success(function(data){
	// 	    console.log(data);
	// 	})
	// 	.error(function(data){
	// 	    console.log(data);
	// 	})
	// };
	
	// FB.api('/me', {fields: 'last_name, first_name, picture'}, function(response) {
	//     console.log('Successful login for: ' + JSON.stringify(response));

	//     facebook(response);
	// });
	
	// profile.logout = function(){
	//     FB.logout(function(response){
	// 	console.log(response);		
	//     });
	// };

	// profile.share = function(){
	//     var body = 'Reading JS SDK documentation';
	//     FB.api('/me/feed', 'post', { message: body }, function(response) {
	// 	if (!response || response.error) {
	// 	    alert('Error occured');
	// 	} else {
	// 	    alert('Post ID: ' + response.id);
	// 	}
	//     });
	// };
    })

