'use strict'
//controller coach
var Coach = require('../models/coach').modelCoach;
var getToken = require('./token');
var jwt = require('jwt-simple');
var config = require('../config/database');
var Team = require('../models/team').modelTeam;


exports.getNameTeam = function(req, res) {
    let token = getToken(req.headers);
    let coach_id = req.body.coach_id;

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        Coach.findById(coach_id, function(err, coach) {
            if (err) throw err;
            let nameTeam = coach.team.name_club;

            res.status(202).json({
                success: true,
                nameTeam
            })
        });
    }
}
exports.getCoach = function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        console.log(decoded);
        Coach.findOne({
            email: decoded.email,
            password: decoded.password
        }, function(err, coach) {
            if (err) throw err;

            if (!coach) {
                return res.status(403).send({
                    success: false,
                    msg: 'Coach not found.'
                });
            } else {
                res.json({
                    success: true,
                    coach: coach
                });
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }

};
