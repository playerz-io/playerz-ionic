'use strict';

angular.module('starter')
.filter('getMinutes', function(){

    return (input) => {
      return input.substring(0,2);
    }
});
