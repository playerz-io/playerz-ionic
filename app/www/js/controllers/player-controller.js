angular.module('starter.controller.player', [])
    .controller('PlayerCtrl', function(TeamService, $stateParams){
	
	var self = this;
	
	self.playerId = $stateParams.playerId;
	self.getPlayer = function(){
	    TeamService.getPlayerById(self.playerId)
		.success(function(data){
		    console.log(data);
		    self.player = data.player;
		})
		.error(function(data){
		    console.log(data);
		})
	};
	
	self.getPlayer();
});
