'use strict';
angular.module('starter.controller.match', [])
    .controller('MatchTabCtrl', function(TeamService, $q, $state, $filter, $ionicPopup, $ionicModal, MatchService, $scope, $timeout, StorageService, $cordovaToast) {

        var self = this;

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        $scope.match = {
            against_team: '',
            place: '',
            type: '',
            date: new Date()
        };

        let resetMatch = () => {
            $scope.match = {
                against_team: '',
                place: 'Domicile',
                type: 'Officiel',
                date: new Date()
            };
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
            resetMatch();
            $scope.modal.hide();
        };

        $scope.addMatch = function() {
            $scope.match.date = new Date($scope.match.date);
            $scope.match.against_team = $filter('uppercase')($scope.match.against_team);
            //$scope.match.place = !$scope.togglePlace ? 'Exterieur' : 'Domicile';
            //$scope.match.type = !$scope.toggleType ? 'Officiel' : 'Amical';
            console.log($scope.match.place, $scope.match.type);
            MatchService.addMatch($scope.match)
                .success(function(data) {
                    console.log(data);
                    $cordovaToast.showShortBottom(data.msg);
                    resetMatch();
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

        self.goMatchComeUp = () => {
            $state.go('match-comeup');
        }

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


    });
