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
let fromMail = `"Playerz" <support@playerz.io>`;
let mailTemplate = require('../templates/mail').template;

exports.forgotPassword = function(req, res) {

    let email = req.body.email;

    if (!email) {
        let msg = 'Saisissez une adresse mail !'
        return Utils.error(res, msg);
    }

    if (email) {
        if (!Utils.validateEmail(email)) {
            let msg = "Respecter le format d'une adresse mail"
            return Utils.error(res, msg);
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
                    let msg = "Cet utilisateur n'exsite pas";
                    return Utils.error(res, msg);
                }

                if (coach.connected === 'facebook') {
                    let msg = "Votre connexion a été effectué avec Facebook !!";
                    return Utils.error(res, msg);
                }

                coach.resetPasswordToken = token;
                coach.resetPasswordExpires = Date.now() + 3600000;

                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);

                    done(err, token, coach);
                });
            });
        },

        (token, coach, done) => {
            let smtpTransport = nodemailer.createTransport(mg(auth));
            console.log(coach.email);
            let mailOptions = {
                to: coach.email,
                from: fromMail,
                subject: 'Réinitialisation de votre mot de passe',
                text: `Bonjour, ${coach.first_name}

Cliquez sur le lien ci-dessous pour réinitialiser le mot de passe de votre compte Playerz

http://playerz.io/reset_password/${token}

Ne prenez pas en compte ce mail, si vous n'avez pas demandé à réinitialiser votre mot de passe.

A bientôt,

Playerz Team`,
                html: mailTemplate(coach.first_name, `Cliquez sur le lien ci-dessous pour réinitialiser le mot de passe de votre compte Playerz :
              <br>
              <br>
              <a href="http://playerz.io/reset_password/${token}">http://playerz.io/reset_password/${token}</a>
              <br>
              <br>
              Ne prenez pas en compte ce mail, si vous n'avez pas demandé à réinitialiser votre mot de passe.

`, `Réinitialisation de votre mot de passe`)

            };

            smtpTransport.sendMail(mailOptions, (err) => {
                if (err)
                    return Utils.errorIntern(res, err);


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
        let msg = 'Remplissez tous les champs !!';
        return Utils.error(res, msg);
    }

    if (password !== confPassword) {
        let msg = 'Les deux mots de passe sont différents';
        return Utils.error(res, msg);
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
                    let msg = "Password reset token is invalid or has expired.";
                    return Utils.error(res, msg);
                }

                coach.password = password;
                coach.resetPasswordToken = undefined;
                coach.resetPasswordExpires = undefined;

                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);

                    done(null, coach);
                });

            });
        },

        (coach, done) => {

            let smtpTransport = nodemailer.createTransport(mg(auth));

            let mailOptions = {
                to: coach.email,
                from: fromMail,
                subject: 'Changement de mot de passe',
                text: `Bonjour, ${coach.first_name}

Votre mot de passe a bien été changé.

Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:

contact@playerz.io

Cordialement,

L'équipe Playerz

                `,
                html: mailTemplate(coach.first_name, `Votre mot de passe a bien été changé.
              <br>
              <br>
              Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:
              <br>
              <br>
              <a href='mailto:contact@playerz.io'>contact@playerz.io</a>`, 'Changement de mot de passe')
            };

            smtpTransport.sendMail(mailOptions, (err) => {
                if (err)
                    return Utils.errorIntern(res, err);

                return res.status(202).json({
                    success: true,
                    msg: 'Le mot de passe a été changé'
                });
            });
        }
    ])

};

exports.changePassword = (req, res) => {

    let currentPassword = req.body.current_password;
    let newPassword = req.body.new_password;
    let confNewPassword = req.body.conf_new_password;
    let dataAuth = res.locals.data;
    let coachId = dataAuth.id;

    if (!newPassword || !confNewPassword || !currentPassword) {
        let msg = "Un ou plusieurs champs requis n'ont pas été saisies"
        return Utils.error(res, msg);
    }

    async.waterfall([

        (done) => {
            Coach.findById(coachId, (err, coach) => {
                let password = coach.password;

                coach.comparePassword(currentPassword, (err, isMatch) => {

                    if (err || !isMatch) {
                        let msg = 'Mauvais mot de passe';
                        return Utils.error(res, msg);
                    } else {
                        done(null, coach)
                    }
                });
            });

        },

        (coach, done) => {
            if (newPassword !== confNewPassword) {
                let msg = `Les deux mots de passe sont différents`;
                return Utils.error(res, msg);
            } else if (newPassword.length < 6 || confNewPassword.length < 6) {
                let msg = 'Votre de passe doit contenir au moins 6 caractères'
                return Utils.error(res, msg);
            } else {
                coach.password = newPassword;
                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);

                    let smtpTransport = nodemailer.createTransport(mg(auth));

                    let mailOptions = {
                        to: coach.email,
                        from: fromMail,
                        subject: 'Changement de mot de passe',
                        text: `Bonjour, ${coach.first_name}

Votre mot de passe a bien été changé.

Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:

contact@playerz.io

A bientôt,

Playerz Team`,
                        html: mailTemplate(coach.first_name, `Votre mot de passe a bien été changé.
                          <br>
                          <br>
                          Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:
                          <br>
                          <br>
                          <a href='mailto:contact@playerz.io'>contact@playerz.io</a>`, 'Changement de mot de passe')
                    };

                    smtpTransport.sendMail(mailOptions, (err) => {
                        if (err)
                            return Utils.errorIntern(res, err);
                    });

                    return res.status(200).json({
                        success: true,
                        coach,
                        msg: 'Votre mot de passe a été mis à jour'
                    });
                });

            }
        }
    ]);
};

exports.changeEmail = (req, res) => {

    let dataAuth = res.locals.data;
    let newEmail = req.body.email;

    if (!newEmail) {
        return res.status(400).json({
            success: false,
            msg: "Saisissez une adresse mail"
        });
    }

    if (newEmail) {
        if (!Utils.validateEmail(newEmail)) {
            return res.status(400).json({
                success: false,
                msg: "Respecter le format d'une adresse mail"
            });
        }
    }

    let coachId = dataAuth.id;

    async.waterfall([

        (done) => {
            Coach.find({
                email: newEmail
            }, (err, coach) => {
                console.log('new coach', coach);
                if (coach.length === 0) {
                    done(null);
                } else {
                    return res.status(400).json({
                        success: false,
                        msg: `Ce mail est déjà associé à un autre compte Playerz`
                    });
                }
            });
        },

        (done) => {
            Coach.findById(coachId, (err, coach) => {
                if (err)
                    return Utils.errorIntern(res, err);
                let oldEmail = coach.email;
                coach.email = newEmail

                if (oldEmail === newEmail) {
                    return res.status(400).json({
                        success: false,
                        msg: `La nouveau email est le même que l'ancien`
                    });
                }

                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);
                });

                done(null, oldEmail, newEmail, coach);

            });
        },

        (oldEmail, newEmail, coach, done) => {

            let smtpTransport = nodemailer.createTransport(mg(auth));

            let mailOptionsOldMail = {
                to: oldEmail,
                from: fromMail,
                subject: `Changement d'email`,
                text: `Bonjour, ${coach.first_name}

Cette adresse mail n'est plus lié à votre compte Playerz.

Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:

contact@playerz.io

A bientôt,

Playerz Team`,
                html: mailTemplate(coach.first_name, `Cette adresse mail n'est plus lié à votre compte Playerz.
                    <br>
                    <br>
                    Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:
                    <br>
                    <br>
                    <a href='mailto:contact@playerz.io'>contact@playerz.io</a>`, `Changement d'email`)
            };

            let mailOptionsNewMail = {
                to: newEmail,
                from: fromMail,
                subject: `Changement d'email`,
                text: `Bonjour, ${coach.first_name}

Votre adresse mail a bien été changé. Voici, votre nouvelle adresse lié à Playerz.

Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:

contact@playerz.io

A bientôt,

Playerz Team`,
                html: mailTemplate(coach.first_name, `Votre adresse mail a bien été changé. Voici, votre nouvelle adresse lié à Playerz.
<br>
<br>
Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:
<br>
<br>
<a href='mailto:contact@playerz.io'>contact@playerz.io</a>`, `Changement d'email`)


            };

            smtpTransport.sendMail(mailOptionsOldMail, (err) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });

            smtpTransport.sendMail(mailOptionsNewMail, (err) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });

            return res.status(202).json({
                success: true,
                msg: 'Votre email a changé'
            });
        }
    ]);
};

exports.changeNumber = (req, res) => {

    let dataAuth = res.locals.data;
    let number = req.body.number;

    if (!number) {
        return res.status(400).json({
            success: false,
            msg: "Saisissez un numéro de téléphone"
        });
    }

    let coachId = dataAuth.id;

    async.waterfall([

        (done) => {
            Coach.findById(coachId, (err, coach) => {
                if (err)
                    return Utils.errorIntern(res, err);
                coach.number_tel = number;

                coach.save((err) => {
                    if (err)
                        return Utils.errorIntern(res, err);
                });

                done(null, number, coach);

            });
        },

        (number, coach, done) => {

            let smtpTransport = nodemailer.createTransport(mg(auth));

            let mailOptions = {
                to: coach.email,
                from: fromMail,
                subject: `Changement de numéro de téléphone`,
                text: `Bonjour, ${coach.first_name}

Votre numéro de téléphone a bien été changé.

Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:

contact@playerz.io

A bientôt,

Playerz Team`,
                html: mailTemplate(coach.first_name, `Votre numéro de téléphone a bien été changé.
                <br>
                <br>
                Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter à l'adresse ci-dessus:
                <br>
                <br>
                <a href='mailto:contact@playerz.io'>contact@playerz.io</a>`, `Changement de numéro de téléphone`)
            };

            smtpTransport.sendMail(mailOptions, (err) => {
                if (err)
                    return Utils.errorIntern(res, err);
            });

            return res.status(202).json({
                success: true,
                msg: 'Votre numéro a changé'
            });
        }
    ]);
};
