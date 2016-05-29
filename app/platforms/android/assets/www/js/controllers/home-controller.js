'use strict'
angular.module('starter.controller.home', [])

.controller('HomeTabCtrl', function(ProfileService) {
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

});
