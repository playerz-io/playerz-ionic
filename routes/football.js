'use strict';

let express = require('express');
let router = express.Router();
let controllerClub = require('../controllers/clubs');
let passport = require('passport');
let football = require('../sports/football/categories');

router
    .get('/categories_football', football.getCategoriesFoot)
    .get('/french_division_football', football.getFrenchDivisionFoot);

module.exports = router;
