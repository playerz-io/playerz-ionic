'use strict';

let express          = require('express');
let router           = express.Router();
let controllerPlayer = require('../controllers/player');
let passport         = require('passport');
let handleToken      = require('../middleware/middleware').handleToken;
let routes           = ['/getGlobalStatistics',
                        '/getStatisticsMatch',
                        '/getMatchPlayed',
                        '/position'];
router
    .use(routes, (req, res, next) => {
        handleToken(req, res, next);
    })
    //add position to playerSelected
    .post('/position', passport.authenticate('jwt', {
        session: false
    }), controllerPlayer.addPosition)

    .get('/getMatchPlayed', passport.authenticate('jwt', {
        session: false
    }), controllerPlayer.getMatchPlayed)

    .get('/getStatisticsMatch', passport.authenticate('jwt', {
        session: false
    }), controllerPlayer.getStatisticsMatch)

    .get('/getGlobalStatistics', passport.authenticate('jwt', {
        session: false
    }), controllerPlayer.getGlobalStatistics);

module.exports = router;
