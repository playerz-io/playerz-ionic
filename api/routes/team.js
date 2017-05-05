'use strict';

let express        = require('express');
let router         = express.Router();
let controllerTeam = require('../controllers/team');
let passport       = require('passport');
let handleToken    = require('../middleware/middleware').handleToken;
let routes         = ['/player',
                      '/player/:id',
                      '/players',
                      '/player'];

router
    .use(routes, (req, res, next) => {
        handleToken(req, res, next);
    })
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
