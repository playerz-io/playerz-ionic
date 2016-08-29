'use strict'

angular.module('starter')
    .service('UserService', function(API_ENDPOINT, $http, $httpParamSerializerJQLike) {

        let changePassword = (settingsPassword) =>
            $http.post(`${API_ENDPOINT.url}/changePassword`, settingsPassword);

        let changeMail = (email) => $http.post(`${API_ENDPOINT.url}/changeEmail`, {
            email
        });

        let changeNumber = (number) => $http.post(`${API_ENDPOINT.url}/changeNumber`, {
            number
        });

        let getCountries = () => $http.get(`${API_ENDPOINT.url}/countries`);

        let checkEmail = (email) => $http.post(`${API_ENDPOINT.url}/checkEmail`, {
            email
        });

        let checkPassword = (password, confirmation_password) => $http.post(`${API_ENDPOINT.url}/checkPassword`, {
            password,
            confirmation_password
        });


        return {
            checkPassword,
            checkEmail,
            getCountries,
            changeNumber,
            changePassword,
            changeMail
        }
    });
