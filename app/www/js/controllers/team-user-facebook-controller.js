'use strict'

angular.module('starter.controller.team-user-facebook', [])
    .controller('TeamUserFacebookCtrl', function(AuthService, FacebookService, $ionicPopup, $state) {

        var self = this;

        self.team = {
            name_club: '',
            category: '',
            division: ''
        };

        self.addTeamFacebookUser = () => {
            FacebookService.addTeamFacebookUser(self.team)
                .success((data) => {
                    $state.go('register.profile');
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
