'use strict';
angular.module('starter.controller.home', [])

.controller('HomeTabCtrl', function(PaymentService, ProfileService, AuthService,
                                    $ionicPopover, $scope, $state, $ionicModal) {
    let self = this;
    let dataProfile;
    // TODO: signifier à l'utilisateur qu'il doit absolument donner ses coordonnées
    // self.charge = () => {
    //     return stripe.card.createToken(self.payment)
    //         .then((response) => {
    //             console.log(response);
    //             PaymentService.saveTokenStripe(response.id)
    //                 .success((data) => {
    //                     console.log(data);
    //                 })
    //                 .error((data) => {
    //                     console.log(data);
    //                 });
    //
    //             $scope.modal.hide();
    //
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         })
    //
    // };

    $ionicModal.fromTemplateUrl('templates/payment-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then((modal) => {
        $scope.modal = modal;
    });


    $scope.openModal = function() {
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    ProfileService.getCoach()
        .success(function(data) {
            console.log(data);
            let dataProfile = data.coach;
            // if (dataProfile.total_connexion === 1) {
            //     $scope.openModal();
            // }

            self.last_name = dataProfile.last_name;
            self.first_name = dataProfile.first_name;

        })
        .error(function(data) {
            console.log(data);
        });


    $ionicPopover.fromTemplateUrl('templates/menu-popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    let hidePopover = () => {
        $scope.popover.hide();
    };
    self.logout = function() {
        hidePopover();
        AuthService.logout();
        $state.go('login');
    };

    self.goProfile = () => {
        hidePopover();
        $state.go('profile-setting');
    };

    self.goMainSetting = () => {
        hidePopover();
        $state.go('main-settings');
    }
});
