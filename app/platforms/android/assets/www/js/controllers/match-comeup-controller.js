'use strict'

angular.module('starter.controller.match-comeup', [])
    .controller('MatchComeUpCtrl', function($q, $timeout, TeamService, $state, $filter, $ionicPopup, $ionicModal, MatchService, $scope, StorageService, $cordovaToast) {

        let self = this;

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        self.showDelete = false;

        $scope.match = {
            against_team: '',
            place: '',
            type: '',
            date: ''
        };

        self.getNewMatchComeUp = function() {
            MatchService.getMatchComeUp()
                .success(function(data) {
                    console.log(data);
                    self.matchs = data.matchs;
                    $scope.$broadcast('scroll.refreshComplete');
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        $ionicModal.fromTemplateUrl('templates/add-match-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        })

        $scope.openModal = function() {
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        $scope.addMatch = function() {
            $scope.match.date = new Date($scope.match.date);
            $scope.match.against_team = $filter('uppercase')($scope.match.against_team);
            MatchService.addMatch($scope.match)
                .success(function(data) {
                    console.log(data);
                    $cordovaToast.showShortBottom(data.msg);
                    $scope.match = {};
                    $scope.modal.hide();

                })
                .error(function(data) {
                    console.log(data);
                    let alertPopup = $ionicPopup.alert({
                        title: 'Erreur',
                        template: data.msg
                    });
                });
        };

        self.saveMatchID = function(match) {
            StorageService.addStorageMatchId(match._id);

            $state.go('tactique', {
                matchId: match._id
            });
        };

        self.getMatchComeUp = function() {
            MatchService.getMatchComeUp()
                .success(function(data) {
                    console.log(data);
                    self.matchs = data.matchs;
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.removeMatch = function(id) {
            MatchService.removeMatch(id)
                .success(function(data) {
                    $cordovaToast.showShortBottom(data.msg);
                    console.log(data);
                    self.getMatchComeUp();
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getNameTeam = function() {
            TeamService.nameTeam()
                .success(function(data) {
                    console.log(data);
                    self.nameTeam = data.nameTeam;
                })
                .error(function(data) {
                    console.log(data);
                });
        };

        self.getBillingName = function(match) {
            if (match.place === 'Domicile') {
                self.billingName = `${self.nameTeam} <br /> - <br /> ${match.against_team}`;
            } else {
                self.billingName = `${match.against_team} <br /> - <br /> ${self.nameTeam}`;
            }
            return self.billingName;
        };

        $scope.getNameClub = () => {
            TeamService.getNameClub()
                .success((data) => {
                    console.log(data);
                    self.clubsArray = data.arrayNameClub;
                });
        };
        $scope.getNameClub();

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

        self.defaultCategory = (category) => {
            if (category === 'Sénior')
                return true
        }
        $scope.searchClubs = () => {
            _search($scope.match.against_team, 'clubs').then(
                function(matches) {
                    if ($scope.match.against_team.length === 0) {
                        $scope.clubs = {};
                    } else {
                        $scope.clubs = matches;
                    }
                }
            )
        };

        $scope.selectedClubs = (index) => {
            $scope.match.against_team = $scope.clubs[index];
            $scope.clubs = {};
        };



        self.getNameTeam();
        self.getMatchComeUp();


    });
