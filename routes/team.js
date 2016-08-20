'use strict';

let express = require('express');
let router = express.Router();
let controllerTeam = require('../controllers/team');
let passport = require('passport');

router
//add Player to Team
    .post('/player', passport.authenticate('jwt', {
        session: false
    }), controllerTeam.addPlayer)
    //get players
    .get('/players', passport.authenticate('jwt', {
        session: false
    }), controllerTeam.getPlayers)
    //get Player by Id
    .get('/player/:id', passport.authenticate('jwt', {
        session: false
    }), controllerTeam.getPlayerById)
    //remove player
    .delete('/player', passport.authenticate('jwt', {
        session: false
    }), controllerTeam.removePlayer);

module.exports = router;
