angular.module('starter.controller.troop', [])
    .controller('TroopTabCtrl', function($ionicPopup, TeamService, $scope, $timeout){
	
	var self = this;

	self.player = {
	    first_name: '',
	    last_name: ''
	};

	self.addPlayer = function(){
	    TeamService.addPlayer(self.player)
		.success(function(data){
		    self.getPlayers();
		    console.log(data);
		    self.player = {};
		    
		})
		.error(function(){
		    console.log(data);
		})
	    
	};

	self.getPlayers = function(){
	    TeamService.getPlayers()
		.success(function(data){
		    console.log(data);
		    self.players = data.players;
		})
		.error(function(data){
		    console.log(data);
		})
	};

	self.removePlayer = function(id){
	    TeamService.removePlayer(id)
		.success(function(data){
		    console.log(id);
		    self.getPlayers();
		})
		.error(function(data){
		    console.log(data);
		})
	}
	self.getPlayers();
	
    });
