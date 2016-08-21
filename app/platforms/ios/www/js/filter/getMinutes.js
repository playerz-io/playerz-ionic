'use strict';

angular.module('starter')
.filter('getMinutes', function(){

    return (input) => {
      console.log(input.split(':')[0]);
      return input.split(':')[0];

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
