'use strict'

angular.module('starter.controller.facebook-team', [])
    .controller('FacebookTeamCtrl', function(AuthService, FacebookService, $ionicPopup, $state, StorageService) {

        var self = this;
        self.coachId = StorageService.getStorageCoachId();

        self.team = {
            name_club: '',
            category: '',
            division: '',
            coach_id: self.coachId
        };

        self.addTeamFacebookUser = () => {

            FacebookService.addTeamFacebookUser(self.team)
                .success((data) => {
                    console.log(data);
                    $state.go('profile');

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
