'use strict';

let getToken = require('../controllers/token');
let jwt = require('jwt-simple');
let config = require('../config/database');

//middleware that decode token and send data user to next function
exports.handleToken = (req, res, next) => {

    let token = getToken(req.headers);

    if (token) {

        let decoded = jwt.decode(token, config.secret);
        let data = decoded.data;
        res.locals.data = data;
        next();

    } else {

        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};
