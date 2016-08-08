'use strict';

angular.module('starter')
.filter('getMinutes', function(){

    return (input) => {
      return input.substring(0,2);
    }
})
.filter('getResult', () => {
    return (input) => {
      if( input === 'defeat'){
        return 'D';
      }

      if(input === 'victory'){
        return 'V';
      }

      if(input === 'draw'){
        return 'N';
      }
    }
})
