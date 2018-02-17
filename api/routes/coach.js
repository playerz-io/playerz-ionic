'use strict';

let express         = require('express');
let router          = express.Router();
let controllerCoach = require('../controllers/coach');
let passport        = require('passport');
let handleToken     = require('../middleware/middleware').handleToken;
let routes = ['/coach', '/coach_by_id', '/nameTeam'];

router
    .use(routes, (req, res, next) => {
      handleToken(req, res, next);
    })
    .get('/coach', controllerCoach.getCoach)
    .get('/coach_by_id', passport.authenticate('jwt', {
        session: false
    }), controllerCoach.getCoachById)
    .put('/coach', passport.authenticate('jwt', {
        session: false
    }), controllerCoach.updateCoach)
    .get('/nameTeam', passport.authenticate('jwt', {
        session: false
    }), controllerCoach.getNameTeam);


module.exports = router;
