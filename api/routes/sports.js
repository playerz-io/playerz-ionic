'use strict';

let express = require('express');
let router = express.Router();
let controllerSports = require('../controllers/sports');
let passport = require('passport');

router
    .get('/sports', controllerSports.getSports)
    .get('/posts', controllerSports.getPosts);

module.exports = router;
