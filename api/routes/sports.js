'use strict';

let express          = require('express');
let router           = express.Router();
let controllerSports = require('../controllers/sports');
let passport         = require('passport');
let handleToken      = require('../middleware/middleware').handleToken;
let routes           = ['/posts'];
router
    .get('/sports', controllerSports.getSports)
    .use(routes, (req, res, next) => {
        handleToken(req, res, next);
    })
    .get('/posts', controllerSports.getPosts);

module.exports = router;
