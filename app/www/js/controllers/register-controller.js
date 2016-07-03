'use strict'

angular.module('starter.controller.register', [])
    .controller('RegisterCtrl', function(AuthService, $ionicPopup, $state, TeamService) {
        let self = this;

        self.user = {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            country: '',
            sport: '',
            type: '',
            genre: '',
            name_club: '',
            category: '',
            division: '',
            birth_date: ''
        };


        self.register = function() {
            self.user.birth_date = new Date(self.user.birth_date);
            AuthService.register(self.user).then(function(msg) {
                console.log(msg);
                $state.go('login');
                self.user = {};
            }, function(errMsg) {
                let alertPopup = $ionicPopup.alert({
                    title: 'Erreur Inscription !',
                    template: errMsg
                });
            });

        };

    });
