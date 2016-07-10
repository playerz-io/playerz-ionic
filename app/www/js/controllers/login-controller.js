'use strict'

angular.module('starter.controller.login', [])

.controller('LoginCtrl', function($state, AuthService, $ionicPopup, StorageService, $location) {
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
            var alertPopup = $ionicPopup.alert({
                title: 'Erreur',
                template: errMsg
            });
        });
    };

    loginCtrl.loginFacebook = function() {
        FB.login(function(response) {
            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                FB.api('/me', {
                    fields: 'last_name, first_name, picture, email, gender, id'
                }, (response) => {
                    console.log('Datas recues de facebook : ', response);
                    AuthService.registerFacebook(response)
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
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {
            scope: 'public_profile, email'
        });
    };

});
