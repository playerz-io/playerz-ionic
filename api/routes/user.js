'use strict';

let express = require('express');
let router = express.Router();
let controllerUser = require('../controllers/user');
let passport = require('passport');
let Utils = require('../utils');
router
    .post('/forgotPassword', controllerUser.forgotPassword)
    .post('/resetPassword', controllerUser.resetPassword)
    .post('/changePassword', passport.authenticate('jwt', {
        session: false
    }), controllerUser.changePassword)
    .post('/changeEmail', passport.authenticate('jwt', {
        session: false
    }), controllerUser.changeEmail)
    .post('/changeNumber', passport.authenticate('jwt', {
        session: false
    }), controllerUser.changeNumber)
    .get('/countries', Utils.getCountries);


module.exports = router;
