'use strict'
angular.module('starter.controller.forgot', [])
    .controller('ForgotCtrl', function(AuthService, FacebookService, $ionicPopup, $state) {

        let self = this;

        self.forgotPassword = () => {
            AuthService.forgotPassword(self.email)
                .success((data) => {
                    console.log(data);
                    $ionicPopup.alert({
                        title: 'Information',
                        template: data.msg
                    }).then((res) => {
                        $state.go('login');
                    });
                })
                .error((data) => {
                    console.log(data);
                    $ionicPopup.alert({
                        title: 'Erreur',
                        template: data.msg
                    });
                })
        }
    });
