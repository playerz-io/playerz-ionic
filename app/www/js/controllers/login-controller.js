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
            console.log(msg);
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
                    console.log(response);
                    AuthService.registerFacebook(response)
                        .success(function(data) {
                          console.log(data);
                            let team = data.newCoach.team;
                            if (team  === undefined || team === null) {
                                $state.go('sport');
                            } else {
                              $state.go('profile');
                            }
                            StorageService.addStorageCoachId(data.newCoach._id);
                            AuthService.useCredentials();
                            AuthService.storeUserCredentials(data.token);

                        })
                        .error(function(data) {
                            console.log(data);
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
