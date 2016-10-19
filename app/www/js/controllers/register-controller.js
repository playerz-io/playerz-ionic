'use strict';

angular
    .module('starter.controller.register', [])
    .controller('RegisterCtrl', function($q, $timeout, $ionicPopup, $state, AuthService, TeamService, $cordovaToast, UserService, SportService, getSports) {
        let self = this;

        self.user = {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirmation_password: '',
            country: '',
            sport: '',
            genre: 'Féminin',
            name_club: '',
            category: 'Sénior',
            division: '',
            birth_date: ''
        };

        self.user.birth_date = new Date();

        self.sports = getSports.data.sports;

        self.register = function() {
            console.log(self.user);
            self.user.birth_date = new Date(self.user.birth_date);
            AuthService.register(self.user).then(function(msg) {

                $cordovaToast.showShortBottom(msg)
                $state.go('login');
                self.user = {};
            }, function(errMsg) {
                console.log(errMsg);
                let alertPopup = $ionicPopup.alert({
                    cssClass: 'popup-center-text',
                    title: 'Erreur Inscription !',
                    template: errMsg
                });
            });
        };

        self.getCountries = () => {
            UserService.getCountries()
                .success((data) => {
                    self.countriesObject = data;
                });
        };
        self.getCountries();

        self.getNameClub = () => {
            TeamService.getNameClub()
                .success((data) => {
                    self.clubsArray = data.arrayNameClub;
                });
        };
        self.getNameClub();

        self.getFrenchDivisionFootball = () => {
            TeamService.getFrenchDivisionFootball()
                .success((data) => {
                    self.divisionFootballArray = data._frenchDivision;
                });
        }
        self.getFrenchDivisionFootball();

        let _search = function(searchFilter, type) {
            console.log('Searching clubs for ' + searchFilter);
            var deferred = $q.defer();
            let array = null;
            if (type === 'clubs') array = self.clubsArray;
            if (type === 'categories') array = self.categoriesArray;
            if (type === 'country') array = self.countriesObject;
            if (type === 'division') array = self.divisionFootballArray;
            console.log(array);
            var matches = array.filter(function(club) {
                if (club.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1)
                    return true;
            });
            $timeout(function() {
                deferred.resolve(matches);
            }, 100);
            return deferred.promise;
        };


        self.searchCountries = () => {
            _search(self.user.country, 'country').then(
                (matches) => {
                    console.log(matches);
                    if (self.user.country.length === 0) {
                        self.countries = {};
                    } else {
                        self.countries = matches;
                    }
                }
            )
        };

        self.selectedCountries = (index) => {
            self.user.country = self.countries[index];
            self.countries = {};
            self.hideCountry = false;
        };

        self.searchFrenchDivision = () => {
            _search(self.user.division, 'division').then(
                (matches) => {
                    console.log(matches);
                    if (self.user.division.length === 0) {
                        self.divisions = {};
                    } else {
                        self.divisions = matches;
                    }
                }
            )
        };

        self.selectedDivisions = (index) => {
            self.user.division = self.divisions[index];
            self.divisions = {};
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


    });
