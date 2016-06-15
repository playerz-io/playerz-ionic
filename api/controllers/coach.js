'use strict'
//controller coach
var Coach = require('../models/coach').modelCoach;
var getToken = require('./token');
var jwt = require('jwt-simple');
var config = require('../config/database');
var Team = require('../models/team').modelTeam;



exports.addSportFacebookUser = (req, res) => {
    let token = getToken(req.headers);
    let sport = req.body.sport;

    if (!sport) {
        return res.status(400).json({
            success: false,
            msg: 'Choisissez un sport !!!'
        });

    }

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;

        Coach.findById(coach_id, (err, coach) => {

            if (err) {
                throw err;
            }

            coach.sport = sport;
            coach.save();

            res.status(202).json({
                success: true,
                msg: 'Sport ajouté',
                coach
            });
        });


    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports.addTeamFacebookUser = (req, res) => {
    let token = getToken(req.headers);

    let name_club = req.body.name_club;
    let category = req.body.category;
    let division = req.body.division;

    if (!name_club || !category || !division) {
        return res.status(400).json({
            success: false,
            msg: "Un ou plusieurs champs requis n'ont pas été remplis"
        });
    }

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coach_id = decoded._id;
        Coach.findById(coach_id, (err, coach) => {

            if (err) {
                throw err;
            }

            let newTeam = new Team({
                name_club,
                category,
                division
            });

            coach.team = newTeam;

            coach.save();

            res.status(202).json({
                success: true,
                msg: 'Equipe ajouté',
                coach
            });

        });
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }

};

exports.getNameTeam = function(req, res) {
    let token = getToken(req.headers);
    let coach_id = req.query.coach_id;

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        Coach.findById(coach_id, function(err, coach) {
            if (err)
                throw err;
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
                throw err;


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
    //let email = req.body.email;
    //let password = req.body.password;
    let country = req.body.country;
    let description = req.body.description;
    let birth_date = req.body.birth_date;
    if (token) {
        let decoded = jwt.decode(token, config.secret);

        Coach.findById(decoded._id, (err, coach) => {

            coach.first_name = first_name;
            coach.last_name = last_name;
            coach.country = country;
            coach.description = description;
            coach.birth_date = birth_date;

            coach.save((err) => {
                if (err)
                    throw err;
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
