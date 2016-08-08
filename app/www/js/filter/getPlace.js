'use strict';

angular.module('starter')
.filter('getPlace', function(){

    return (input) => {
      if(input){
        return 'Domicile'
      }else {
        return 'Exterieur';
      }
    }
});
