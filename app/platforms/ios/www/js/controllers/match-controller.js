angular.module('starter.controller.match', [])
    .controller('MatchTabCtrl', function($ionicPopup, MatchService, $scope, $timeout, StorageService){

	var self = this;

	self.match = {
	    against_team: '',
	    place: '',
	    type: '',
	    date: ''
	};

	self.saveMatchID = function(match_id){
	    StorageService.addStorage(match_id);
	};

	self.addMatch = function(){
	    MatchService.addMatch(self.match)
		.success(function(data){
		    self.getMatchs();
		    self.match = {};

		})
		.error(function(data){
		    console.log(data);
		})
	};

	self.getMatchs = function(){
	    MatchService.getMatchs()
		.success(function(data){
		    self.matchs = data.matchs;
		})
		.error(function(data){
		    console.log(data);
		})
	};

	self.removeMatch = function(id){
	    MatchService.removeMatch(id)
		.success(function(data){
		    console.log(data);
		    self.getMatchs();
		})
		.error(function(data){
		    console.log(data);
		})
	};

	self.getMatchs();

    });
