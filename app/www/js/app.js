// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
'use strict';

angular.module('starter', ['ionic', 'starter.controller.login', 'starter.controller.profile', 'starter.controller.register', 'starter.controller.home', 'starter.controller.troop', 'starter.controller.player', 'starter.controller.match', 'starter.controller.tactique', 'starter.directives.fourFourtwo', 'starter.directives.fourThreethree', 'firebase', 'ngStorage', 'starter.controller.match-stat', 'disableAll', 'starter.controller.summary-stat',
        'ionic-table', 'starter.controller.match-comeup', 'starter.controller.match-played', 'starter.controller.stat-end-match', 'starter.controller.profile-setting', 'starter.controller.player-statistics', 'starter.controller.facebook-sport', 'starter.controller.facebook-team', 'starter.controller.forgot', 'starter.controller.reset', 'starter.controller.account', 'starter.controller.main-settings',
        'starter.controller.change-password', 'ngCordova', 'ngDraggable', 'ngMaterial', 'starter.controller.stat-in-live', 'starter.controller.stat-in-live-player', 'ngCordovaOauth'
    ])
    // TODO: 'angular-stripe',
    .constant('FIREBASE_URI', 'https://boos.firebaseio.com/')

.constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT', {
    //url: 'http://localhost:5000/api'
    url: 'https://secret-plateau-96989.herokuapp.com/api'
})

.run(function($ionicPlatform, $rootScope, $state, AuthService, AUTH_EVENTS, $window) {

    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

    });

    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, fromState) {

        if (next.name === 'tactique' || next.name === 'match-statistics') {
            screen.lockOrientation('landscape');
        } else {
            screen.unlockOrientation();
        }

        if (!AuthService.isAuthenticated()) {
            console.log(next.name);
            if (next.name !== 'login' && next.name !== 'register' && next.name !== 'register.profile' && next.name !== 'register.team' && next.name !== 'register.privateInfo' && next.name !== 'sport' && next.name !== 'team-user-facebook' && next.name !== 'profile' && next.name !== 'forgot' && next.name !== 'reset' && next.name !== 'register-facebook-team' && next.name !== 'register-facebook-sport') {
                event.preventDefault();
                $state.go('login');
            }

        } else {
            if (AuthService.isAuthenticated()) {
                if (next.name === 'login' || next.name === 'register' || next.name === 'register.profile' || next.name === 'register.team' || next.name === 'register.privateInfo') {
                    event.preventDefault();
                    $state.go('profile.home');
                }
            }
        }
    });



    $rootScope.user = {};

    $window.fbAsyncInit = function() {

        FB.init({
            appId: '508256989378454',
            cookie: true, // enable cookies to allow the server to access
            // the session
            xfbml: true, // parse social plugins on this page
            version: 'v2.5' // use graph api version 2.5
        });

    };

})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $mdGestureProvider) {

    //set tabs in bottom for all platform
    $ionicConfigProvider.tabs
        .position("bottom")
        .style("standard");


    $mdGestureProvider.skipClickHijack();

    //set key stripe
    // stripeProvider.setPublishableKey('pk_test_DmbU7fQcToQjn3DyOH35uBuc');

    $stateProvider

        .state('login', {
            url: '/',
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl as login'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'templates/register.html',
            controller: 'RegisterCtrl as register'
        })
        .state('register.profile', {
            url: '/register-profile',
            views: {
                'register-profile': {
                    templateUrl: 'templates/register-profile.html'
                }
            }
        })
        .state('register.privateInfo', {
            url: '/register-privateInfo',
            views: {
                'register-privateInfo': {
                    templateUrl: 'templates/register-privateInfo.html'
                }
            }
        })
        .state('register.team', {
            url: '/register-team',
            views: {
                'register-team': {
                    templateUrl: 'templates/register-team.html'
                }
            }
        })
        .state('profile', {
            url: '/profile',
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl as profile'
        })
        .state('profile.home', {
            url: '/home',
            views: {
                'home-tab': {
                    templateUrl: "templates/home.html",
                    controller: 'HomeTabCtrl as home'
                }
            }
        })
        .state('profile.troop', {
            url: '/troop',
            views: {
                'troop-tab': {
                    templateUrl: "templates/troop.html",
                    controller: 'TroopTabCtrl as troop'
                }
            }
        })
        .state('profile.match', {
            url: '/match',
            views: {
                'match-tab': {
                    templateUrl: "templates/match.html",
                    controller: 'MatchTabCtrl as matchCtrl'
                }
            }
        })
        .state('match-comeup', {
            url: '/comeup',
            templateUrl: 'templates/match-comeup.html',
            controller: 'MatchComeUpCtrl as comeup'
        })
        .state('match-played', {
            url: '/played',
            templateUrl: 'templates/match-played.html',
            controller: 'MatchPlayedCtrl as played'
        })
        .state('player', {
            url: '/player',
            templateUrl: "templates/player.html",
            controller: 'PlayerCtrl as player',
            params: {
                playerId: null
            }
        })
        .state('tactique', {
            url: '/tactique',
            templateUrl: 'templates/tactique.html',
            controller: 'TactiqueCtrl as tactique',
            params: {
                matchId: null,
            }
        })
        .state('match-statistics', {
            url: '/match-statistics',
            templateUrl: 'templates/match-statistics.html',
            controller: 'MatchStatCtrl as matchStat',
            params: {
                matchId: null,
            }
        })
        .state('summary-stat', {
            url: '/summary-stat',
            templateUrl: 'templates/summary-stat.html',
            controller: 'SummaryStatCtrl as summary'
        })
        .state('stat-end-match', {
            url: '/stat-end-match',
            templateUrl: 'templates/stat-end-match.html',
            controller: 'StatEndMatchCtrl as statEndMatch',
            params: {
                matchId: null
            }
        })
        .state('profile-setting', {
            url: '/profile-setting',
            templateUrl: 'templates/profile-setting.html',
            controller: 'ProfileSettingCtrl as profileSetting'
        })
        .state('player-statistics', {
            url: '/player-statistics',
            templateUrl: 'templates/player-statistics.html',
            controller: 'PlayerStatCtrl as playerStat',
            params: {
                matchId: null,
                playerId: null
            }
        })
        .state('register-facebook-sport', {
            url: '/facebook-sport',
            controller: 'FacebookSportCtrl as sport',
            templateUrl: 'templates/facebook-sport.html'

        })
        .state('register-facebook-team', {
            url: '/facebook-team',
            templateUrl: 'templates/facebook-team.html',
            controller: 'FacebookTeamCtrl as team'
        })
        .state('forgot', {
            url: '/forgot',
            templateUrl: 'templates/forgot.html',
            controller: 'ForgotCtrl as forgot'
        })
        .state('reset', {
            url: '/reset/:token',
            templateUrl: 'templates/reset.html',
            controller: 'ResetCtrl as reset'
        })
        .state('main-settings', {
            url: '/main-settings',
            templateUrl: 'templates/main-settings.html',
            controller: 'MainSettingsCtrl as settings'
        })
        .state('account', {
            url: '/account',
            templateUrl: 'templates/account.html',
            controller: 'AccountCtrl as account'
        })
        .state('change-password', {
            url: '/changePassword',
            templateUrl: 'templates/change-password.html',
            controller: 'ChangePasswordCtrl as changePassword'
        })
        .state('stat-in-live', {
            url: '/stat-in-live',
            templateUrl: 'templates/stat-in-live.html',
            controller: 'StatInLiveCtrl as statInLive'
        })
        .state('stat-in-live-player', {
            url: '/stat-in-live-player',
            templateUrl: 'templates/stat-in-live-player.html',
            controller: 'StatInLivePlayerCtrl as statInLivePlayer',
            params: {
                playerId: null
            }
        });


    $urlRouterProvider.otherwise('/');

});
