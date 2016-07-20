'use strict'

angular.module('starter.controller.profile-setting', [])
    .controller('ProfileSettingCtrl', function(ProfileService, $scope) {

        //force to display back button
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

        let self = this;

        self.getCoachById = () => {
            ProfileService.getCoachById()
                .success((data) => {
                    self.coach = data.coach;
                    self.coach.birth_date = new Date(self.coach.birth_date);
                    console.log(data);
                })
                .error((data) => {
                    console.log(data);
                })
        };

        self.updateCoach = () => {
            ProfileService.updateCoach(self.coach)
                .success((data) => {
                    console.log(data);
                })
                .error((data) => {
                    console.log(data);
                })
        };

        self.getCoachById();

    });
