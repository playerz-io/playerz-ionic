'use strict'
angular.module('starter.controller.main-settings', [])

.controller('MainSettingsCtrl', function($state, $http, StorageService, ProfileService, AuthService, $ionicModal, $scope, FacebookService){

  let self = this;

  self.coachId = StorageService.getStorageCoachId();

  self.getCoach = () => {
    ProfileService.getCoachById()
    .success( (data) => {
      console.log(data);
      self.coach = data.coach;
    })
    .error((data) => {
      console.log(data);
    })
  };

  self.getCoach();



})
