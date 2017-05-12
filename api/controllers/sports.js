'use strict';

let Football = require('../sports/football/football');
let Handball = require('../sports/handball/handball');
let getToken = require('./token');
let jwt      = require('jwt-simple');
let config   = require('../config/database');
let Coach    = require('../models/coach').modelCoach;

exports.getSports = (req, res) => {


    // TODO: add sports
    let sports = [Football.FOOTBALL];

    res.status(200).json({
        sports
    });
}


exports.getPosts = (req, res) => {
    let dataAuth = res.locals.data;

    Coach.findById(dataAuth.id, function(err, coach) {

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
};
