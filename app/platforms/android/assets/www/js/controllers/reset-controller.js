'use strict'
angular.module('starter.controller.reset', [])
    .controller('ResetCtrl', function(AuthService, FacebookService, $ionicPopup, $state, $stateParams) {

        var self = this;

        self.resetPassword = () => {
            AuthService.resetPassword($stateParams.token, self.password, self.confPassword)
                .success((data) => {
                    console.log(data);
                    let popup = $ionicPopup.alert({
                        title: 'Information',
                        template: data.msg
                    });

                    popup.then((res) => {
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
        };

    });
