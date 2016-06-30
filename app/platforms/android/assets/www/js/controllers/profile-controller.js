'use strict'
angular.module('starter.controller.profile', [])

.controller('ProfileCtrl', function($state, $ionicPopup, $http, StorageService, ProfileService, AuthService, $ionicModal, $scope, FacebookService) {

    var self = this;
    var dataProfile;

    self.coachId = StorageService.getStorageCoachId();

    self.team = {
        name_club: '',
        category: '',
        division: '',
        coach_id: self.coachId
    };

    ProfileService.getCoach()
        .success(function(data) {
            self.coach = data.coach;
            console.log(data);
            //check if user facebook has team
            if (!data.coach.hasOwnProperty('team')) {
                $scope.openModalTeam();
            }
            //check if user facebook has sport
            if (!data.coach.hasOwnProperty('sport')) {
                $scope.openModalSport();
            }
        })
        .error(function(data) {
            console.log(data);
        })

    $ionicModal.fromTemplateUrl('templates/add-team-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalTeam = modal;
    });

    $scope.openModalTeam = function() {
        $scope.modalTeam.show();
    };

    $scope.closeModalTeam = function() {
        $scope.modalTeam.hide();
    };

    self.addTeamFacebookUser = () => {

        FacebookService.addTeamFacebookUser(self.team)
            .success((data) => {
                console.log(data);
                $scope.closeModalTeam();
            })
            .error((data) => {
                $ionicPopup.alert({
                    title: 'Erreur',
                    template: data.msg
                });
            })
    };

    self.addSportFacebookUser = () => {
        console.log(self.coachId);
        FacebookService.addSportFacebookUser(self.sport, self.coachId)

        .success((data) => {
                console.log(data);
                $scope.closeModalSport();
            })
            .error((data) => {
                $ionicPopup.alert({
                    title: 'Erreur',
                    template: data.msg
                });
                console.log(data);
            })
    };

    $ionicModal.fromTemplateUrl('templates/add-sport-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalSport = modal;
    });

    $scope.openModalSport = function() {
        $scope.modalSport.show();
    };

    $scope.closeModalSport = function() {
        $scope.modalSport.hide();
    };



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
