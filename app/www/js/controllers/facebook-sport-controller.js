'use strict'
angular.module('starter.controller.facebook-sport', [])
    .controller('FacebookSportCtrl', function(AuthService, FacebookService, $ionicPopup, $state, StorageService) {

        var self = this;

        self.coachId = StorageService.getStorageCoachId();

        self.addSportFacebookUser = () => {
            console.log(self.coachId);
            FacebookService.addSportFacebookUser(self.sport, self.coachId)

            .success((data) => {
                    $state.go('register-facebook-team');
                    console.log(data);
                })
                .error((data) => {
                    $ionicPopup.alert({
                        cssClass: 'popup-center-text',
                        title: 'Erreur',
                        template: data.msg
                    });

                    console.log(data);
                })
        };
    });
