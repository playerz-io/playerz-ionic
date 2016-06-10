'use strict'
angular.module('starter.controller.home', [])

.controller('HomeTabCtrl', function(ProfileService, AuthService, $ionicPopover, $scope, $state) {
    let self = this;
    let dataProfile;
    ProfileService.getCoach()
        .success(function(data) {
            dataProfile = data.coach;
            self.last_name = dataProfile.last_name;
            self.first_name = dataProfile.first_name;

        })
        .error(function(data) {
            console.log(data);
        })


    $ionicPopover.fromTemplateUrl('templates/menu-popover.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.popover = popover;
    });

    self.logout = function() {
        $scope.popover.hide();
        AuthService.logout();
        $state.go('login');
    };

    self.goProfile = () => {
        $scope.popover.hide();
        $state.go('profile-setting');
    }
});
