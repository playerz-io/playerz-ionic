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

exports.addSportFacebookUser = (req, res) => {
    let sport = req.body.sport;
    let coach_id = req.body.coach_id;

    if (!sport) {
        return res.status(400).json({
            success: false,
            msg: 'Choisissez un sport !!!'
        });
    }

    Coach.findById(coach_id, (err, coach) => {
        console.log(coach);
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
};

exports.addTeamFacebookUser = (req, res) => {
    let name_club = req.body.name_club;
    let category = req.body.category;
    let division = req.body.division;
    let coach_id = req.body.coach_id;


    if (!name_club || !category || !division) {
        return res.status(400).json({
            success: false,
            msg: "Un ou plusieurs champs requis n'ont pas été remplis"
        });
    }

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

            //create token for authentication jwt
            let token = jwt.encode(coach, config.secret);
            res.status(202).json({
                success: true,
                msg: 'Equipe ajouté',
                coach
            });

        });
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

exports.forgotPassword = function(req, res) {

    let email = req.body.email;

    if (!email) {
        return res.status(400).json({
            msg: 'Saisissez un email !!'
        })
    }
    async.waterfall([

        (done) => {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(null, token);
            });
        },

        (token, done) => {
            Coach.findOne({
                email
            }, (err, coach) => {

                if (!coach) {
                    return res.status(400).json({
                        msg: "Cet utilisateur n'exsite pas"
                    });
                }

                if (coach.connected === 'facebook') {
                    return res.status(400).json({
                        msg: "Votre connexion à été effectué avec Facebook !!"
                    });
                }

                coach.resetPasswordToken = token;
                coach.resetPasswordExpires = Date.now() + 3600000;

                coach.save((err) => {
                    done(err, token, coach);
                });
            });
        },

        (token, coach, done) => {
            let auth = {
                auth: {
                    api_key: 'key-2cbf56735c697b79b2b69306c4d0b79c',
                    domain: 'sandbox23aac40875ed43708170487989939d3f.mailgun.org'
                }
            };

            let smtpTransport = nodemailer.createTransport(mg(auth));

            let mailOptions = {
                to: coach.email,
                from: 'postmaster@sandbox23aac40875ed43708170487989939d3f.mailgun.org',
                subject: 'Playerz mot de passe oublié',
                text: `http://localhost:8100/#/reset/${token}`

            };

            smtpTransport.sendMail(mailOptions, (err) => {
                if (err)
                    throw err;
                return res.status(202).json({
                    success: true,
                    msg: 'Un mail vous a été envoyé'
                });
            });
        }

    ]);

};

exports.resetPassword = function(req, res) {
    let password = req.body.password;
    let confPassword = req.body.confPassword;
    let token = req.body.token;

    if (!password || !confPassword) {
        return res.status(400).json({
            success: false,
            msg: 'Remplissez tous les champs !!'
        });
    }

    if (password !== confPassword) {
        return res.status(400).json({
            success: false,
            msg: 'Les deux mots de passe sont différents'
        });
    }
    async.waterfall([
        (done) => {
            Coach.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function(err, coach) {
                if (!coach) {
                    return res.status(400).json({
                        msg: "Password reset token is invalid or has expired."
                    });
                }

                coach.password = password;
                coach.resetPasswordToken = undefined;
                coach.resetPasswordExpires = undefined;

                coach.save((err) => {
                    if (err)
                        throw err;

                    done(null, coach);
                });

            });
        },

        (coach, done) => {

            let auth = {
                auth: {
                    api_key: 'key-2cbf56735c697b79b2b69306c4d0b79c',
                    domain: 'sandbox23aac40875ed43708170487989939d3f.mailgun.org'
                }
            };

            let smtpTransport = nodemailer.createTransport(mg(auth));

            let mailOptions = {
                to: coach.email,
                from: 'postmaster@sandbox23aac40875ed43708170487989939d3f.mailgun.org',
                subject: 'Le mot a été changé',
                text: `Votre mot de passe a bien été changé`
            };

            smtpTransport.sendMail(mailOptions, (err) => {
                if (err)
                    throw err;
                return res.status(202).json({
                    success: true,
                    msg: 'Le mot de passe a été changé'
                });
            });
        }
    ])

};
