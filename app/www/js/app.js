// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controller.login', 'starter.controller.profile', 'starter.controller.register', 'starter.controller.home', 'starter.controller.troop', 'starter.controller.player', 'starter.controller.match', 'starter.controller.matchdetail', 'starter.controller.tactique', 'starter.directives.fourFourtwo', 'starter.directives.fourThreethree', 'firebase', 'ngStorage', 'starter.controller.match-stat', 'disableAll', 'starter.controller.summary-stat',
    'ionic-table', 'starter.controller.change'
])

.constant('FIREBASE_URI', 'https://boos.firebaseio.com/')

.constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT', {
    url: 'http://localhost:5000/api'
        //url: 'https://floating-castle-92524.herokuapp.com/api'
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
        if (!AuthService.isAuthenticated()) {
            console.log(next.name);
            if (next.name !== 'login' && next.name !== 'register' && next.name !== 'register.profile' && next.name !== 'register.team') {
                event.preventDefault();
                $state.go('login');
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

    }

})

.config(function($stateProvider, $urlRouterProvider) {
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
                    controller: 'HomeTabCtrl'
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
        .state('player', {
            url: '/player',
            templateUrl: "templates/player.html",
            controller: 'PlayerCtrl as player',
            params: {
                playerId: null
            }
        })
        .state('matchDetail', {
            url: '/matchDetail',
            templateUrl: 'templates/match-detail.html',
            controller: 'MatchDetailCtrl as matchDetail',
            params: {
                matchId: null
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
        .state('change', {
            url: '/change',
            templateUrl: 'templates/change.html',
            controller: 'ChangeCtrl as change'
        })

    $urlRouterProvider.otherwise('/');

})
