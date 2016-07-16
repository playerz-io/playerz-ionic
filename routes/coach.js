'use strict';

let express = require('express');
let router = express.Router();
let controllerCoach = require('../controllers/coach');
let passport = require('passport');

router
    .get('/coach', passport.authenticate('jwt', {
        session: false
    }), controllerCoach.getCoach)
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
