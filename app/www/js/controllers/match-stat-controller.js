'use strict'

angular.module('starter.controller.match-stat', [])
  .controller('MatchStatCtrl', function(MatchService, StorageService, PlayerService, FireService) {

    let self = this;

    self.disable = true;
    self.coachId = StorageService.getStorageCoachId();
    self.matchId = StorageService.getStorage();
    console.log(self.matchId);
    self.playerSelected_firebase = FireService.refPlayer(FireService.refMatch(self.matchId, self.coachId));


    //update statistic of player, set the stat in params stat
    self.updateStatistic = function(player_id, stat) {
      PlayerService.updateStatistic(player_id, self.matchId, stat)
        .success(function(data) {
          console.log(data);
          // data of match
          self.playerSelected = data.playerSelected;

        })
        .error(function(data) {
          console.log(data);
        })
    };

    // get Match with match id
    self.getMatch = function() {
      MatchService.getMatchById(self.matchId)
        .success(function(data) {
          console.log(data);
          // data of match
          self.match = data.match;
          self.coach_id = data.coach_id;
          console.log(self.match);
        })
        .error(function(data) {
          console.log(data);
        })
    };

    // get player selected of match with match id
    self.getPlayerSelected = function() {
      MatchService.getPlayerSelected(self.matchId)
        .success(function(data) {
          console.log(data.playerSelected);
          // data of player
          self.playerSelected = data.playerSelected;
        })
        .error(function(data) {
          console.log(data);
        })
    };

    //count ball touched
    self.countBallPlayed = function(player) {
      self.updateStatistic(player.$id, "ballPLayed");
      console.log(player.$id.toString());
      PlayerService.addSchema(self.matchId, player.$id.toString())
        .success(function(data) {
          console.log(data);
        })
        .error(function(data) {
          console.log(data);
        })
    };

    self.countMainAction = function(action){
      console.log(action)
      PlayerService.countMainAction(self.matchId, action)
      .success(function(data){
        console.log(data);
      })
      .error(function(data){
        console.log(data);
      })
    };

    self.getMatch();
    self.getPlayerSelected();
    //playerSelected for data in real time

  });
