'use strict'
angular.module('starter.controller.sport', [])
    .controller('SportCtrl', function(AuthService, FacebookService, $ionicPopup, $state) {

        var self = this;

        self.addSportFacebookUser = () => {
            FacebookService.addSportFacebookUser(self.sport)
                .success((data) => {
                    $state.go('team-user-facebook');
                    console.log(data);
                })
                .error((data) => {
                    $ionicPopup.alert({
                        title: 'Erreur',
                        template: data.msg
                    });

                    console.log(data);
                })
        };
    });
