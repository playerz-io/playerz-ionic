'use strict';
angular.module('starter.controller.account', [])

.controller('AccountCtrl', function($cordovaToast, $state, $http, StorageService, ProfileService, AuthService, $ionicModal, $scope, FacebookService, UserService) {

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

            })
            .error((data) => {
                var alertPopup = $ionicPopup.alert({
                    cssClass: 'popup-center-text',
                    title: 'Error',
                    template: data.msg
                });
                console.log(data.msg);
            })
    };

    self.changeMail = () => {
        UserService.changeMail(self.coach.email)
            .success((data) => {
                console.log(data);
                AuthService.logout();
                $cordovaToast.showShortBottom(data.msg);
                $state.go('login')
            })
            .error((data) => {
                var alertPopup = $ionicPopup.alert({
                    cssClass: 'popup-center-text',
                    title: 'Error',
                    template: data.msg
                });
                console.log(data);
            })
    };

    self.changeNumber = () => {
        UserService.changeNumber(self.coach.number_tel)
            .success((data) => {
                $cordovaToast.showShortBottom(data.msg);
                console.log(data);
            })
            .error((data) => {
                var alertPopup = $ionicPopup.alert({
                    cssClass: 'popup-center-text',
                    title: 'Error',
                    template: data.msg
                });
                console.log(data);
            })
    };

    self.getCoach();
});
