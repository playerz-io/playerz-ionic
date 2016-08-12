'use strict'
//controller coach
var Coach = require('../models/coach').modelCoach;
var getToken = require('./token');
var jwt = require('jwt-simple');
var config = require('../config/database');
var Team = require('../models/team').modelTeam;
let async = require('async');
let crypto = require('crypto');
let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');
let auth = require('../config/mailgun').auth;
let bcrypt = require('bcrypt');


exports.getNameTeam = function(req, res) {
    let token = getToken(req.headers);


    if (token) {
        let decoded = jwt.decode(token, config.secret);
        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                return Utils.errorIntern(res, err);

            let nameTeam = coach.team.name_club;

            res.status(202).json({
                success: true,
                nameTeam
            })
        });
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
}

exports.getCoachById = function(req, res) {
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        Coach.findById(decoded._id, function(err, coach) {
            if (err)
                return Utils.errorIntern(res, err);


            res.status(202).json({
                success: true,
                coach
            })
        });
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
}

exports.getCoach = function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
  
        Coach.findOne({
            email: decoded.email,
            password: decoded.password
        }, function(err, coach) {
            if (err)
                return Utils.errorIntern(res, err);

            if (!coach) {
                return res.status(403).send({
                    success: false,
                    msg: 'Coach not found.'
                });
            } else {
                res.json({
                    success: true,
                    coach
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

exports.updateCoach = function(req, res) {

    let token = getToken(req.headers);
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let country = req.body.country;
    let description = req.body.description;
    let birth_date = req.body.birth_date;
    let website_club = req.body.website_club;
    let website_perso = req.body.website_perso;

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id, (err, coach) => {
            if (err)
                return Utils.errorIntern(res, err);

            coach.first_name = first_name;
            coach.last_name = last_name;
            coach.country = country;
            coach.description = description;
            coach.birth_date = birth_date;
            coach.website_perso = website_perso;
            coach.website_club = website_club;

            coach.save((err) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });

            res.status(202).json({
                success: true,
                msg: 'coach updated',
                coach: coach
            })
        });
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};
