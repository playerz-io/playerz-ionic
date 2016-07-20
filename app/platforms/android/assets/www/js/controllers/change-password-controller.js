'use strict'
angular.module('starter.controller.change-password', [])

.controller('ChangePasswordCtrl', function($state, $ionicPopup, $http, StorageService, UserService, AuthService, $ionicModal, $scope, FacebookService, $cordovaToast) {

    let self = this;

    self.settingsPassword = {
        current_password: '',
        new_password: '',
        conf_new_password: ''
    }

    self.changePassword = () => {
        UserService.changePassword(self.settingsPassword)
            .success((data) => {
                console.log(data);
                self.settingsPassword = {};
                AuthService.logout();
                $state.go('login')
                $cordovaToast.showShortBottom(data.msg);

            })
            .error((data) => {
                console.log(data.msg);
                $cordovaToast.showShortBottom(data.msg);
            })
    }


});
