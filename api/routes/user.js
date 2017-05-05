'use strict';

let express        = require('express');
let router         = express.Router();
let controllerUser = require('../controllers/user');
let passport       = require('passport');
let Utils          = require('../utils');
let handleToken    = require('../middleware/middleware').handleToken;
let routes         = ['/changeEmail', '/changePassword', '/changeNumber'];

router
    .post('/forgotPassword', controllerUser.forgotPassword)
    .post('/resetPassword', controllerUser.resetPassword)
    .get('/countries', Utils.getCountries)
    .use(routes, (req, res, next) => {
        handleToken(req, res, next);
    })
    .post('/changePassword', passport.authenticate('jwt', {
        session: false
    }), controllerUser.changePassword)
    .post('/changeEmail', passport.authenticate('jwt', {
        session: false
    }), controllerUser.changeEmail)
    .post('/changeNumber', passport.authenticate('jwt', {
        session: false
    }), controllerUser.changeNumber);



module.exports = router;
