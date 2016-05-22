angular.module('starter.controller.tactique', [])
  .controller('TactiqueCtrl', function($stateParams, TeamService, MatchService, PlayerService, FireService, $localStorage, StorageService) {

    var self = this;


    self.matchId = StorageService.getStorage();
    self.coachId = StorageService.getStorageCoachId();
    var refMatch = FireService.refMatch(StorageService.getStorage(), self.coachId);

    //get Player of troop
    self.getPlayers = function() {
      TeamService.getPlayers()
        .success(function(data) {
          console.log(data);
          self.players = data.players;

        })
        .error(function() {
          console.log(data);
        })
    };

    //change the formation
    self.addFormation = function() {
      TeamService.addFormation(self.formation, StorageService.getStorage())
        .success(function(data) {
          self.getTactique();
          console.log(data);
        })
        .error(function(data) {
          console.log(data);
        })
    };

    // return posts of formation
    self.getTactique = function() {
      MatchService.getTactique(self.formation)
        .success(function(data) {
          console.log(data);
          self.post = data.tactique;
        })
        .error(function(data) {
          console.log(data);
        })
    };

    //add player to the selection of current match
    self.addPlayerSelected = function(player_id, position) {
      console.log(player_id);
      MatchService.addPlayerSelected(player_id, StorageService.getStorage(), position)
        .success(function(data) {
          console.log(data);
        })
        .error(function(data) {
          console.log(data);
        })
    };

    //remove player to the selection of current match
    self.removePlayerSelected = function(player_id, player) {
      MatchService.removePlayerSelected(player_id, StorageService.getStorage())
        .success(function(data) {

          console.log(data);
        })
        .error(function(data) {
          console.log(data);
        })
    };


    self.playerSelected = FireService.refPlayer(refMatch);
    console.log(self.playerSelected);
    console.log('self.playerSelected :' + self.matchId);

    //add position to player
    self.addPosition = function(player_id, position) {
      PlayerService.addPosition(player_id, position, self.matchId)
        .success(function(data) {
          console.log(data);
        })
        .error(function(data) {
          console.log(data);
        })
    }

    //call add formation here for get position as soons as
    // tactique page is loaded
    self.addFormation();
    self.getPlayers();

  });
