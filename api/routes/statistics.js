'use strict';

let express = require('express');
let router = express.Router();
let controllerStat = require('../controllers/statistics');
let passport = require('passport');

router
    .post('/statistic', passport.authenticate('jwt', {
        session: false
    }), controllerStat.updateStatistic)
    // push schema
    .post('/schema', passport.authenticate('jwt', {
        session: false
    }), controllerStat.addPlayerSchema)
    .post('/action', passport.authenticate('jwt', {
        session: false
    }), controllerStat.countMainAction)
    .post('/avgRelance', passport.authenticate('jwt', {
        session: false
    }), controllerStat.avgRelance)
    .post('/removeAction', passport.authenticate('jwt', {
        session: false
    }), controllerStat.removeAction);
    // .post('/totalStat', passport.authenticate('jwt', {
    //     session: false
    // }), controllerStat.totalStat);

module.exports = router;
