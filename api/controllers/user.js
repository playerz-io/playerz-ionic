'use strict';

let getToken = require('./token');
let jwt = require('jwt-simple');
let config = require('../config/database');
let Team = require('../models/team').modelTeam;
let async = require('async');
let crypto = require('crypto');
let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');
let auth = require('../config/mailgun').auth;
let bcrypt = require('bcrypt');
var Coach = require('../models/coach').modelCoach;

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

exports.changePassword = (req, res) => {

    let token = getToken(req.headers);
    let currentPassword = req.body.current_password;
    let newPassword = req.body.new_password;
    let confNewPassword = req.body.conf_new_password;

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coachId = decoded._id;

        async.waterfall([

            (done) => {
                Coach.findById(coachId, (err, coach) => {
                    let password = coach.password;

                    coach.comparePassword(currentPassword, (err, isMatch) => {

                        if (err || !isMatch) {

                            res.status(400).json({
                                success: false,
                                msg: 'Mauvais mot de passe'
                            });
                        } else {
                            done(null, coach)
                        }
                    });
                });

            },

            (coach, done) => {
                if (newPassword !== confNewPassword) {
                    res.status(400).json({
                        success: false,
                        msg: 'Les deux mots de passe sont différents'
                    });
                } else {
                    coach.password = newPassword;
                    coach.save((err) => {
                        if (err)
                            throw err;

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
                        });

                        res.status(200).json({
                            success: true,
                            coach,
                            msg: 'Votre mot de passe à été mis à jour'
                        });
                    });

                }
            }
        ]);
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};
