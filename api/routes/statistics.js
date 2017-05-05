'use strict';

let express        = require('express');
let router         = express.Router();
let controllerStat = require('../controllers/statistics');
let passport       = require('passport');
let handleToken    = require('../middleware/middleware').handleToken;
let routes         = ['/statistics',
                      '/removeAction',
                      '/avgRelance',
                      '/action',
                      '/schema',
                      '/statistic'];
router
    .use(routes, (req, res, next) => {
        handleToken(req, res, next);
    })
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
    }), controllerStat.removeAction)
    .get('/statistics', passport.authenticate('jwt', {
        session: false
    }), controllerStat.getStatMatch);
// .post('/totalStat', passport.authenticate('jwt', {
//     session: false
// }), controllerStat.totalStat);

module.exports = router;
