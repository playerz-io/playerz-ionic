'use strict';

let Football = require('../sports/football/football');
let Handball = require('../sports/handball/handball');
let getToken = require('./token');
let jwt = require('jwt-simple');
let config = require('../config/database');
let Coach = require('../models/coach').modelCoach;

exports.getSports = (req, res) => {

    let sports = [Football.FOOTBALL, Handball.HANDBALL];

    res.status(200).json({
        sports
    });
}


exports.getPosts = (req, res) => {

    let token = getToken(req.headers);

    if (token) {

        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id, function(err, coach) {

            if (err)
                return Utils.errorIntern(res, err);

            let posts = [];

            if (coach.sport === Football.FOOTBALL) {

                posts = Object.keys(Football.POSTS).map((key, index) => {
                    return Football.POSTS[key];
                });

            } else if (coach.sport === Handball.HANDBALL) {

                posts = Object.keys(Handball.POSTS).map((key, index) => {
                    return Handball.POSTS[key];
                });
            }

            res.status(202).json({
                success: true,
                posts
            });
        });

    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }

};
