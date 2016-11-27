'use strict';

let express = require('express');
let router = express.Router();
let controllerMatch = require('../controllers/match/match');
let passport = require('passport');
let handleToken = require('../middleware/middleware').handleToken;

router
    .use('*', (req, res, next) => {
        handleToken(req, res, next);
    })
    //add match
    .post('/match', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.addMatch)
    //get matchs
    .get('/matchs', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.getMatchs)
    //get matchs by id
    .get('/match/:id', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.getMatchById)
    //remove match
    .delete('/match', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.removeMatch)
    //add formation
    .post('/formation', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.addFormation)
    //get post tactique
    .get('/tactique', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.getTactique)
    //add selected_player
    // .post('/player_selected', passport.authenticate('jwt', {
    //     session: false
    // }), controllerMatch.addPlayerSelected)
    //Get player selected
    .get('/player_selected', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.getPlayerSelected)
    // .delete('/player_selected', passport.authenticate('jwt', {
    //     session: false
    // }), controllerMatch.removePlayerSelected)
    // .get('/player_no_selected', passport.authenticate('jwt', {
    //     session: false
    // }), controllerMatch.getPlayerNoSelected)
    //get match comeup
    .get('/match_finished', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.findMatchFinished)
    //get match comeup
    .get('/match_comeup', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.findMatchComeUp)
    .post('/defaultPosition', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.defaultPosition)
    .post('/switchPosition', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.switchPosition)
    .post('/addOpponentBut', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.addOpponentBut)
    .post('/match_finished', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.putMatchFinished)
    .get('/getGlobalStatisticsMatch', passport.authenticate('jwt', {
        session: false
    }), controllerMatch.getGlobalStatisticsMatch)

module.exports = router;
