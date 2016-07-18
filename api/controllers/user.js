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
let Utils = require('../utils');

exports.forgotPassword = function(req, res) {

    let email = req.body.email;

    if (!email) {
        return res.status(400).json({
            msg: 'Saisissez un email !!'
        })
    }

    if (email) {
        if (!Utils.validateEmail(email)) {
            return res.status(400).json({
                success: false,
                msg: "Respecter le format d'une addresse mail"
            });
        }
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

                        return res.status(200).json({
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

exports.changeEmail = (req, res) => {

    let token = getToken(req.headers);
    let newEmail = req.body.email;

    if (!newEmail) {
        return res.status(400).json({
            success: false,
            msg: "Saisissez une addresse mail"
        });
    }

    if (newEmail) {
        if (!Utils.validateEmail(newEmail)) {
            return res.status(400).json({
                success: false,
                msg: "Respecter le format d'une addresse mail"
            });
        }
    }

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coachId = decoded._id;

        async.waterfall([

            (done) => {
                Coach.findById(coachId, (err, coach) => {
                    if (err)
                        throw err;
                    let oldEmail = coach.email;
                    coach.email = newEmail

                    if (oldEmail === newEmail) {
                        return res.status(400).json({
                            success: false,
                            msg: `La nouveau email est le même que l'ancien`
                        })
                    }

                    coach.save();

                    done(null, oldEmail, newEmail);

                });
            },

            (oldEmail, newEmail, done) => {

                let smtpTransport = nodemailer.createTransport(mg(auth));

                let mailOptionsOldMail = {
                    to: oldEmail,
                    from: 'postmaster@sandbox23aac40875ed43708170487989939d3f.mailgun.org',
                    subject: `Changement d'email`,
                    text: `Ce mail n'est plus lié à Playerz`
                };

                let mailOptionsNewMail = {
                    to: newEmail,
                    from: 'postmaster@sandbox23aac40875ed43708170487989939d3f.mailgun.org',
                    subject: `Changement d'email`,
                    text: `Est bien votre nouveau mail`
                };

                smtpTransport.sendMail(mailOptionsOldMail, (err) => {
                    if (err)
                        throw err;
                });

                smtpTransport.sendMail(mailOptionsNewMail, (err) => {
                    if (err)
                        throw err;
                });

                return res.status(202).json({
                    success: true,
                    mgs: 'Votre email a changé'
                });
            }
        ]);
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};

exports.changeNumber = (req, res) => {

    let token = getToken(req.headers);
    let number = req.body.number;

    if (!number) {
        return res.status(400).json({
            success: false,
            msg: "Saisissez un numéro de téléphone"
        });
    }

    if (token) {
        let decoded = jwt.decode(token, config.secret);
        let coachId = decoded._id;

        async.waterfall([

            (done) => {
                Coach.findById(coachId, (err, coach) => {
                    if (err)
                        throw err;
                    coach.number_tel = number;

                    coach.save();

                    done(null, number, coach);

                });
            },

            (number, coach, done) => {

                let smtpTransport = nodemailer.createTransport(mg(auth));

                let mailOptions = {
                    to: coach.email,
                    from: 'postmaster@sandbox23aac40875ed43708170487989939d3f.mailgun.org',
                    subject: `Changement de télphone`,
                    text: `Le numéro de téléphone à changé`
                };

                smtpTransport.sendMail(mailOptions, (err) => {
                    if (err)
                        throw err;
                });

                return res.status(202).json({
                    success: true,
                    mgs: 'Votre numéro a changé'
                });
            }
        ]);
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
};
