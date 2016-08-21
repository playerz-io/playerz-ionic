'use strict'

angular.module('starter')
    .service('PaymentService', function($http, API_ENDPOINT) {

        let saveTokenStripe = (token_stripe) =>
            $http.post(`${API_ENDPOINT.url}/stripe`, {
                token_stripe
            });

        return {
            saveTokenStripe
        }
    })
