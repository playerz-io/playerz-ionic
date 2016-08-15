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
                })
        };
        self.getNameClub();

        let _search = function(searchFilter, type) {
            console.log('Searching clubs for ' + searchFilter);
            var deferred = $q.defer();
            let array = null;
            if (type === 'clubs') array = self.clubsArray;
            if (type === 'categories') array = self.categoriesArray;

            var matches = array.filter(function(club) {
                if (club.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1)
                    return true;
            });
            $timeout(function() {
                deferred.resolve(matches);
            }, 100);
            return deferred.promise;
        };

        self.searchClubs = () => {
            _search(self.user.name_club, 'clubs').then(
                function(matches) {
                    if (self.user.name_club.length === 0) {
                        self.clubs = {};
                    } else {
                        self.clubs = matches;
                    }
                }
            )
        };

        self.selectedClubs = (index) => {
            self.user.name_club = self.clubs[index];
            self.clubs = {};
        };

        self.getCategories = () => {
            TeamService.getCategories()
                .success((data) => {
                    self.categoriesArray = data.categories;
                });
        };
        self.getCategories();

        self.searchCategories = () => {
            _search(self.user.category, 'categories').then(
                function(matches) {
                    if (self.user.category.length === 0) {
                        self.categories = {};
                    } else {
                        self.categories = matches;
                    }
                }
            )
        };

        self.selectedCategories = (index) => {
            self.user.category = self.categories[index];
            self.categories = {};
        };




    });
