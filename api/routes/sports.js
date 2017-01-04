'use strict';

let express = require('express');
let router = express.Router();
let controllerSports = require('../controllers/sports');
let passport = require('passport');
let handleToken = require('../middleware/middleware').handleToken;

router
    .get('/sports', controllerSports.getSports)
    .use('*', (req, res, next) => {
        handleToken(req, res, next);
    })
    .get('/posts', controllerSports.getPosts);

module.exports = router;
