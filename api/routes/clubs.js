'use strict';

let express = require('express');
let router = express.Router();
let controllerClub = require('../controllers/clubs');
let passport = require('passport');
let football = require('../sports/football/categories');

router
    .get('/getNameClub', controllerClub.getNameClub)
    .get('/categories', football.getCategoriesFoot);

module.exports = router;
