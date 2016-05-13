angular.module('starter.controller.matchdetail', [])
    .controller('MatchDetailCtrl', function(MatchService, $stateParams, TeamService, $localStorage, StorageService){
	var self = this;
	
	self.matchId = StorageService.getStorage();
	self.getMatchById = function(){
	    MatchService.getMatchById(StorageService.getStorage())
		.success(function(data){
		    console.log(data);
		    self.match = data.match;
		})
		.error(function(data){
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
	self.getPlayers();
	self.getMatchById();
    });
