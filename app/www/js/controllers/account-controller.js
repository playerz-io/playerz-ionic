'use strict';
angular.module('starter.controller.account', [])

.controller('AccountCtrl', function($state, $ionicPopup, $http, StorageService, ProfileService, AuthService, $ionicModal, $scope, FacebookService, UserService) {

    let self = this;

    self.coachId = StorageService.getStorageCoachId();

    //force to display back button
    $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
        viewData.enableBack = true;
    });

    self.getCoach = () => {
        ProfileService.getCoachById()
            .success((data) => {
                console.log(data);
                self.coach = data.coach;
                if (!self.coach.number) {
                    self.coach.number = "Ajoutez"
                }
            })
            .error((data) => {
                console.log(data);
            })
    };

    self.changeMail = () => {
        console.log('ok');
        UserService.changeMail(self.coach.email)
            .success((data) => {
                console.log(data);
            })
            .error((data) => {
                console.log(data);
            })
    };

    self.getCoach();
});
