'use strict'

angular.module('starter')
    .service('AuthService', function($q, $http, API_ENDPOINT, $rootScope, $httpParamSerializerJQLike, StorageService, $state) {

        var LOCAL_TOKEN_KEY = 'yourTokenKey';
        var isAuthenticated = false;
        var authToken;


        let useCredentials = function(token) {
            isAuthenticated = true;
            authToken = token;

            $http.defaults.headers.common.Authorization = authToken;
        }


        let loadUserCredentials = function() {
            var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
            if (token) {
                useCredentials(token);
            }
        }

        let storeUserCredentials = function(token) {
            window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
            useCredentials(token);
        }



        function destroyUserCredentials() {
            authToken = undefined;
            isAuthenticated = false;
            $http.defaults.headers.common.Authorization = undefined;
            window.localStorage.removeItem(LOCAL_TOKEN_KEY);
        }


        var registerFacebook = function(response) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializerJQLike({
                    last_name: response.last_name,
                    first_name: response.first_name,
                    email: response.email,
                    id_facebook: response.id
                }),
                url: `${API_ENDPOINT.url}/facebook`
            });

        };

        var register = function(user) {
            return $q(function(resolve, reject) {
                $http.post(API_ENDPOINT.url + '/signup', user).then(function(result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        var login = function(user) {

            return $q(function(resolve, reject) {
                $http.post(API_ENDPOINT.url + '/authenticate', user).then(function(result) {
                    if (result.data.success) {
                        console.log(result.data);
                        StorageService.addStorageCoachId(result.data.coach._id);
                        storeUserCredentials(result.data.token);
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        var logout = function() {
            destroyUserCredentials()
        };

        let forgotPassword = (email) =>
            $http.post(`${API_ENDPOINT.url}/forgotPassword`, {
                email
            });

        let resetPassword = (token, password, confPassword) =>
            $http.post(`${API_ENDPOINT.url}/resetPassword`, {
                token,
                password,
                confPassword
            });
        loadUserCredentials()

        return {
            resetPassword,
            forgotPassword,
            login: login,
            register: register,
            logout: logout,
            registerFacebook: registerFacebook,
            storeUserCredentials,
            useCredentials,
            isAuthenticated: function() {
                return isAuthenticated;
            }
        }
    })

.factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS) {
    return {
        responseError: function(response) {
            $rootScope.$broadcast({
                401: AUTH_EVENTS.notAuthenticated,
            }[response.status], response);
            return $q.reject(response);
        }
    };
})

.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
})
