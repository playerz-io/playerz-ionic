'use strict';

angular.module('starter.controller.login', [])

.controller('LoginCtrl', function($state, AuthService, $ionicPopup, StorageService, $location, $q, $cordovaOauth, $http) {
    var loginCtrl = this;

    // document.addEventListener("deviceready", onDeviceReady, false);
    //
    // function onDeviceReady() {
    //     screen.lockOrientation('landscape');
    //     alert(scree.orientation);
    // }

    //Login Jwt Strategy

    loginCtrl.user = {
        email: '',
        password: ''
    };

    loginCtrl.login = function() {
        AuthService.login(loginCtrl.user).then(function(msg) {
            $state.go('profile');
            loginCtrl.user = {};
        }, function(errMsg) {
            console.log(errMsg);
            var alertPopup = $ionicPopup.alert({
                title: 'Erreur',
                template: errMsg
            });
        });
    };

    loginCtrl.loginFacebook = function() {

        $cordovaOauth.facebook("508256989378454", ["email", "public_profile"]).then((result) => {
            console.log(result);
            $http.get("https://graph.facebook.com/v2.5/me", {
                params: {
                    access_token: result.access_token,
                    fields: 'last_name, first_name, picture, email, gender, id',
                    format: "json"
                }
            }).then((result) => {

                AuthService.registerFacebook(result.data)
                    .success(function(data) {
                        console.log('Datas renvoyees a l\'api :', data);
                        AuthService.storeUserCredentials(data.token);
                        StorageService.addStorageCoachId(data.coach._id);
                        //check if coach has a team
                        if (!data.coach.hasOwnProperty('team')) {
                            $state.go('register-facebook-sport');
                        } else {

                            AuthService.useCredentials(data.token);
                            $state.go('profile');
                        }

                    })
                    .error(function(data) {
                        console.log(data);
                        $ionicPopup.alert({
                            title: 'Erreur',
                            template: data.msg
                        });
                    })
            }, (error) => {
                $ionicPopup.alert({
                    title: 'Erreur',
                    template: error
                });

            });

        }, (error) => {
            $ionicPopup.alert({
                title: 'Erreur',
                template: error
            });
        });
    };

});
