'use strict';

let express = require('express');
let router = express.Router();
let controllerSports = require('../sports/sports');
let passport = require('passport');

router
    .get('/sports', controllerSports.getSports);

module.exports = router;
