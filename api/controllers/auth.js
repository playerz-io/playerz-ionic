'use strict';

let async = require('async');
let Coach = require('../models/coach').modelCoach;
let Utils = require('../utils');
let config = require('../config/database');
let Team = require('../models/team').modelTeam;
let jwt = require('jwt-simple');

//connexion facebook
// NOTE: 1
//Recherche s'il n'existe pas un compte
// avec le même email
// NOTE: 2
//Recherche un utilisateur avec son id facebook
//si il existe on récupère ses infos
//sinon on le crée
exports.facebookConnect = (req, res) => {

    let last_name = req.body.last_name;
    let first_name = req.body.first_name;
    let email = req.body.email;
    let country = req.body.country;
    let type = req.body.type;
    let genre = req.body.genre;
    let birth_date = req.body.birth_date;
    let id_facebook = req.body.id_facebook;

    async.waterfall([
        (done) => {
            // TODO: not equals facebook à revoir
            // NOTE: 1
            Coach.findOne({
                email,
                connected: 'jwt'
            }, (err, coach) => {
                if (coach) {
                    //TODO: trouver le bon code erreur correspondnat
                    return res.status(400).json({
                        msg: `Un utilisateur avec l'adresse que vous
                        utilisé pour votre compte facebook existe déjà`
                    });
                } else {
                    done(null);
                }
            })
        },

        (done) => {
            Coach.findOne({
                id_facebook
            }, (err, coach) => {
                if (err)
                    throw err;

                if (!coach) {
                    let newCoach = new Coach({
                        last_name,
                        first_name,
                        connected: 'facebook',
                        email,
                        country,
                        type,
                        genre,
                        birth_date,
                        id_facebook,
                        created_at: Date.now(),
                        total_connexion: 0
                    });

                    //increase total_connexion
                    newCoach.total_connexion++;
                    newCoach.save(function(err) {
                        if (err) {
                            throw err;
                        }
                    });

                    let token = jwt.encode(newCoach, config.secret);
                    return res.status(200).json({
                        success: true,
                        msg: 'Nouvel utilisateur crée',
                        token: 'JWT ' + token,
                        coach: newCoach
                    });
                } else {
                    //increase total_connexion
                    coach.total_connexion++;
                    coach.save();

                }
                let token = jwt.encode(coach, config.secret);
                return res.json({
                    success: true,
                    coach,
                    token: 'JWT ' + token
                });
            });
        }
    ])
};

//signup
// NOTE: 1
//verification du format d'une adresse mail
// NOTE: 2
//si tout les champs ne sont pas remplis
//on renvoie un erreur
//sinon on crée l'utilisateur
exports.signup = (req, res) => {

    let last_name = req.body.last_name;
    let first_name = req.body.first_name;
    let password = req.body.password;
    let email = req.body.email;
    let country = req.body.country;
    let sport = req.body.sport;
    let type = req.body.type;
    let genre = req.body.genre;
    let birth_date = req.body.birth_date;
    let name_club = req.body.name_club;
    let category = req.body.category;
    let division = req.body.division;

    //validation email
    // NOTE: 1
    if (email) {
        if (!Utils.validateEmail(email)) {
            return res.status(400).json({
                success: false,
                msg: "Respecter le format d'une addresse mail"
            });
        }
    }

    // NOTE: 2
    if (!last_name || !email || !first_name || !password || !type || !sport || !country || !genre || !birth_date || !name_club || !category || !division) {
        return res.status(400).json({
            success: false,
            msg: "Un ou plusieurs champs requis n'ont pas été remplis"
        });
    } else {

        Coach.findOne({
            email
        }, (err, coach) => {
            //si le coach n'existe pas deja ds la bdd
            if (!coach) {
                //creation du coach
                let newCoach = new Coach({
                    last_name,
                    first_name,
                    password,
                    email,
                    connected: 'jwt',
                    country,
                    sport,
                    type,
                    genre,
                    birth_date: new Date(birth_date),
                    created_at: Date.now(),
                    total_connexion: 0
                });
                //creation de son equipe
                newCoach.team = new Team({
                    name_club,
                    category,
                    division
                });

                newCoach.save(function(err) {
                    if (err)
                        throw err;

                    res.status(200).json({
                        success: true,
                        msg: 'Nouvel utilisateur crée'
                    });
                });
            } else {
                return res.status(400).json({
                    success: false,
                    msg: 'Un coach existe déjà avec cette addresse mail'
                });
            }
        });
    }
};

//authentication with jwt
exports.authenticationJwt = (req, res) => {

    let email = req.body.email;
    let password = req.body.password;

    if (email) {
        if (!Utils.validateEmail(email)) {
            return res.status(400).json({
                success: false,
                msg: "Respecter le format d'une addresse mail"
            });
        }
    }

    if (!email.toString() || !password.toString()) {
        return res.status(400).json({
            success: false,
            msg: "Les champs email ou mot de passe ne sont pas remplis !"
        });
    }
    //recherche d'un coach par son email
    Coach.findOne({
        email: email
    }, function(err, coach) {
        if (err)
            throw err;

        if (!coach) {
            return res.status(400).json({
                success: false,
                msg: "Le coach n'a pas été trouvé"
            });
        } else {
            //check si le mdp est le bon
            coach.comparePassword(password, function(err, isMatch) {
                if (isMatch && !err) {
                    let token = jwt.encode(coach, config.secret);
                    console.log("token : " + token);
                    //increase total_connexion
                    coach.total_connexion++;
                    coach.save();

                    res.status(200).json({
                        success: true,
                        token: 'JWT ' + token,
                        coach: coach
                    });

                } else {
                    return res.status(400).json({
                        success: false,
                        msg: `Votre mot de passe n'est pas correct`
                    });
                }
            });
        }
    });
};

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
