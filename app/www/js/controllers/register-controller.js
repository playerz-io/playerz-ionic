'use strict';

angular
    .module('starter.controller.register', [])
    .controller('RegisterCtrl', function($q, $timeout, $ionicPopup, $state, AuthService, TeamService, $cordovaToast) {
        let self = this;

        self.user = {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirmation_password: '',
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
                $cordovaToast.showShortBottom(msg)
                $state.go('login');
                self.user = {};
            }, function(errMsg) {
                console.log(errMsg);
                let alertPopup = $ionicPopup.alert({
                    title: 'Erreur Inscription !',
                    template: errMsg
                });
            });
        };

        self.getNameClub = () => {
            TeamService.getNameClub()
                .success((data) => {
                    self.clubsArray = data.arrayNameClub;
                    console.log(data);
                })
                .error((data) => {
                    //console.log(data);
                });
        };
        self.getNameClub();

        let searchClubs = function(searchFilter) {
            console.log('Searching clubs for ' + searchFilter);
            var deferred = $q.defer();
            var matches = self.clubsArray.filter(function(club) {
                //console.log(club);
                if (club.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1) return true;
            });
            $timeout(function() {
                deferred.resolve(matches);
            }, 100);
            return deferred.promise;
        };

        self.search = () => {
            searchClubs(self.user.name_club).then(
                function(matches) {

                    if (self.user.name_club.length === 0) {
                        self.clubs = {};
                    } else {
                        self.clubs = matches;
                    }
                }
            )
        };

        self.selectedItem = (index) => {
            self.user.name_club = self.clubs[index];
            self.clubs = {};
        }
    });
