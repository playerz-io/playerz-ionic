'use strict';

let async = require('async');
let Coach = require('../models/coach').modelCoach;
let Utils = require('../utils');
let config = require('../config/database');
let Team = require('../models/team').modelTeam;
let jwt = require('jwt-simple');
let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');
let auth = require('../config/mailgun').auth;


let _checkPassword = (confirmation_password, password, res) => {
    if (password) {

        if (confirmation_password.length < 6 || password.length < 6) {
            return res.status(404).json({
                success: false,
                msg: 'Votre mot de passe doit contenir au moins 6 caractères'
            });
        }

        if (confirmation_password !== password) {
            return res.status(404).json({
                success: false,
                msg: 'Le mot de passe et la confirmation sont différents'
            });
        }
    } else {
        return res.status(404).json({
            success: false,
            msg: "Ajoutez un mot de passe"
        });
    }

    res.status(200).json({
        success: true
    });
};

let _checkEmail = (email, res) => {
    if (email) {
        if (!Utils.validateEmail(email)) {
            return res.status(404).json({
                success: false,
                msg: "Respecter le format d'une addresse mail"
            });
        }
    } else {
        return res.status(404).json({
            success: false,
            msg: "Ajoutez une adresse mail"
        });
    }

    res.status(200).json({
        success: true
    })
}

exports.checkPassword = (req, res) => {

    let password = req.body.password;
    let confirmation_password = req.body.confirmation_password;

    _checkPassword(confirmation_password, password, res);

};

exports.checkEmail = (req, res) => {
    let email = req.body.email;
    console.log(email);
    _checkEmail(email, res);

}
let mailSubscription = (last_name, first_name, email) => {

    let smtpTransport = nodemailer.createTransport(mg(auth));
    let mailOptions = {
        to: email,
        from: 'postmaster@sandbox23aac40875ed43708170487989939d3f.mailgun.org',
        subject: 'Bienvenue sur Playerz',
        html:''
        /*'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>[SUBJECT]</title>
        <style type="text/css">
        body {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        margin:0 !important;
        width: 100% !important;
        -webkit-text-size-adjust: 100% !important;
        -ms-text-size-adjust: 100% !important;
        -webkit-font-smoothing: antialiased !important;
    }
    .tableContent img {
        border: 0 !important;
        display: block !important;
        outline: none !important;
    }
    a{
        color:#382F2E;
    }

    p, h1{
        color:#382F2E;
        margin:0;
    }
    p{
        text-align:left;
        color:#999999;
        font-size:14px;
        font-weight:normal;
        line-height:19px;
    }

    a.link1{
        color:#382F2E;
    }
    a.link2{
        font-size:16px;
        text-decoration:none;
        color:#ffffff;
    }

    h2{
        text-align:left;
        color:#222222;
        font-size:19px;
        font-weight:normal;
    }
    div,p,ul,h1{
        margin:0;
    }

    .bgBody{
        background: #ffffff;
    }
    .bgItem{
        background: #ffffff;
    }

    @media only screen and (max-width:480px)

    {

        table[class="MainContainer"], td[class="cell"]
        {
            width: 100% !important;
            height:auto !important;
        }
        td[class="specbundle"]
        {
            width:100% !important;
            float:left !important;
            font-size:13px !important;
            line-height:17px !important;
            display:block !important;
            padding-bottom:15px !important;
        }

        td[class="spechide"]
        {
            display:none !important;
        }
        img[class="banner"]
        {
            width: 100% !important;
            height: auto !important;
        }
        td[class="left_pad"]
        {
            padding-left:15px !important;
            padding-right:15px !important;
        }

    }

    @media only screen and (max-width:540px)

    {

        table[class="MainContainer"], td[class="cell"]
        {
            width: 100% !important;
            height:auto !important;
        }
        td[class="specbundle"]
        {
            width:100% !important;
            float:left !important;
            font-size:13px !important;
            line-height:17px !important;
            display:block !important;
            padding-bottom:15px !important;
        }

        td[class="spechide"]
        {
            display:none !important;
        }
        img[class="banner"]
        {
            width: 100% !important;
            height: auto !important;
        }
    .font {
        font-size:18px !important;
        line-height:22px !important;

    }
    .font1 {
        font-size:18px !important;
        line-height:22px !important;

    }
    }

    </style>
    <script type="colorScheme" class="swatch active">
        {
            "name":"Default",
            "bgBody":"ffffff",
            "link":"382F2E",
            "color":"999999",
            "bgItem":"ffffff",
            "title":"222222"
        }
        </script>
        </head>
        <body paddingwidth="0" paddingheight="0"   style="padding-top: 0; padding-bottom: 0; padding-top: 0; padding-bottom: 0; background-repeat: repeat; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased;" offset="0" toppadding="0" leftpadding="0">
        <table bgcolor="#ffffff" width="100%" border="0" cellspacing="0" cellpadding="0" class="tableContent" align="center"  style='font-family:Helvetica, Arial,serif;'>
        <tbody>
        <tr>
        <td><table width="600" border="0" cellspacing="0" cellpadding="0" align="center" bgcolor="#ffffff" class="MainContainer">
        <tbody>
        <tr>
        <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td valign="top" width="40">&nbsp;</td>
    <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tbody>
    <!-- =============================== Header ====================================== -->
        <tr>
        <td height='75' class="spechide"></td>

    <!-- =============================== Body ====================================== -->
        </tr>
        <tr>
        <td class='movableContentContainer ' valign='top'>
        <div class="movableContent" style="border: 0px; padding-top: 0px; position: relative;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td height="35"></td>
        </tr>
        <tr>
        <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td valign="top" align="center" class="specbundle"><div class="contentEditableContainer contentTextEditable">
        <div class="contentEditable">
        <p style='text-align:center;margin:0;font-family:Georgia,Time,sans-serif;font-size:26px;color:#222222;'><span class="specbundle2"><span class="font1">Bonjour </span></span></p>
        </div>
        </div></td>
        <td valign="top" class="specbundle"><div class="contentEditableContainer contentTextEditable">
        <div class="contentEditable">
        <p style='text-align:center;margin:0;font-family:Georgia,Time,sans-serif;font-size:26px;color:#289CDC;'><span class="font">${first_name} !</span> </p>
        </div>
        </div></td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </div>
        <div class="movableContent" style="border: 0px; padding-top: 0px; position: relative;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
        <tr><td height='55'></td></tr>
        <tr>
        <td align='left'>
        <div class="contentEditableContainer contentTextEditable">
        <div class="contentEditable" align='center'>
        <h2 >Bienvenue sur Playerz</h2>
    </div>
    </div>
    </td>
    </tr>

    <tr><td height='15'> </td></tr>

        <tr>
        <td align='left'>
        <div class="contentEditableContainer contentTextEditable">
        <div class="contentEditable" align='center'>
        <p >
        Merci d'avoir choisi Playerz, nous esperons que nos services vous aideront à améliorer vos performances.
    <br>
    <br>
    Vous avez des questions? Prenez contact avec nous via Facebook ou Twitter, ou email. Notre équipe sera toujours là pour vous coacher!
    <br>
    <br>
    A bientôt,
    <br>
    <span style='color:#222222;'>Playerz Team</span>
    </p>
    </div>
    </div>
    </td>
    </tr>

    <tr><td height='55'></td></tr>
        <tr><td height='20'></td></tr>
        </table>
        </div>
        <div class="movableContent" style="border: 0px; padding-top: 0px; position: relative;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td height='65'>
        </tr>
        <tr>
        <td  style='border-bottom:1px solid #DDDDDD;'></td>
        </tr>
        <tr><td height='25'></td></tr>
        <tr>
        <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td valign="top" class="specbundle"><div class="contentEditableContainer contentTextEditable">
        <div class="contentEditable" align='center'>
        <p  style='text-align:left;color:#CCCCCC;font-size:12px;font-weight:normal;line-height:20px;'>
        <span style='font-weight:bold;'>PLAYERZ</span>
        <br>
        contact@playerz.io
    <br>
    <br>
    <a target='_blank' class='link1' class='color:#382F2E;' href="[SHOWEMAIL]">Afficher cet e-mail dans votre navigateur préféré</a>
    </p>
    </div>
    </div></td>
    <td valign="top" width="30" class="specbundle">&nbsp;</td>
    <td valign="top" class="specbundle"><table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td valign='top' width='52'>
        <div class="contentEditableContainer contentFacebookEditable">
        <div class="contentEditable">
        <a target='_blank' href="https://www.facebook.com/wwwplayerzio/"><img src="images/facebook.png" width='52' height='53' alt='facebook icon' data-default="placeholder" data-max-width="52" data-customIcon="true"></a>
        </div>
        </div>
        </td>
        <td valign="top" width="16">&nbsp;</td>
    <td valign='top' width='52'>
        <div class="contentEditableContainer contentTwitterEditable">
        <div class="contentEditable">
        <a target='_blank' href="https://twitter.com/playerz_io"><img src="images/twitter.png" width='52' height='53' alt='twitter icon' data-default="placeholder" data-max-width="52" data-customIcon="true"></a>
        </div>
        </div>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        <tr><td height='88'></td></tr>
    </tbody>
    </table>

    </div>

    <!-- =============================== footer ====================================== -->

        </td>
        </tr>
        </tbody>
        </table>
        </td>
        <td valign="top" width="40">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>


    </body>
    </html>

    '*/

    };

    smtpTransport.sendMail(mailOptions, (err) => {


        if (err)
            return Utils.errorIntern(res, err);

    });
}

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
                if (err) {
                    return Utils.errorIntern(res, err);
                }
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
                    return Utils.errorIntern(res, err);

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

                    mailSubscription(last_name, first_name, email);
                    //increase total_connexion
                    newCoach.total_connexion++;
                    newCoach.save(function(err) {
                        if (err) {
                            return Utils.errorIntern(res, err);
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
                    coach.save((err) => {
                        if (err)
                            return Utils.errorIntern(res, err);
                    });

                }
                let token = jwt.encode(coach, config.secret);
                return res.status(200).json({
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
    let confirmation_password = req.body.confirmation_password;
    let email = req.body.email;
    let country = req.body.country;
    let sport = req.body.sport;
    //let type = req.body.type;
    let genre = req.body.genre;
    let birth_date = req.body.birth_date;
    let name_club = req.body.name_club;
    let category = req.body.category;
    let division = req.body.division;



    //validation email
    // NOTE: 1

    if (email) {
        if (!Utils.validateEmail(email)) {
            return res.json({
                success: false,
                msg: "Respecter le format d'une addresse mail"
            });
        }
    }

    if (password) {

        if (confirmation_password.length < 6 || password.length < 6) {
            return res.json({
                success: false,
                msg: 'Votre mot de passe doit contenir au moins 6 caractères'
            });
        }

        if (confirmation_password !== password) {
            return res.json({
                success: false,
                msg: 'Le mot de passe et la confirmation sont différents'
            });
        }
    }


    // NOTE: 2
    if (!last_name || !email || !first_name || !password || !sport || !country || !genre || !birth_date || !name_club || !category || !division || !confirmation_password) {
        return res.json({
            success: false,
            msg: "Un ou plusieurs champs requis n'ont pas été remplis"
        });
    } else {

        Coach.findOne({
            email
        }, (err, coach) => {

            if (err)
                return Utils.errorIntern(res, err);
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
                    type: 'Coach',
                    genre,
                    birth_date: new Date(birth_date),
                    created_at: Date.now(),
                    total_connexion: 0
                });

                mailSubscription(last_name, first_name, email);

                //creation de son equipe
                newCoach.team = new Team({
                    name_club,
                    category,
                    division
                });

                newCoach.save(function(err) {
                    if (err)
                        return Utils.errorIntern(res, err);

                    return res.json({
                        success: true,
                        msg: 'Votre profil a été crée'
                    });
                });
            } else {
                return res.json({
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
            return res.json({
                success: false,
                msg: "Respecter le format d'une addresse mail"
            });
        }
    }

    if (!email || !password) {
        return res.json({
            success: false,
            msg: "Les champs email ou mot de passe ne sont pas remplis !"
        });
    }
    //recherche d'un coach par son email
    Coach.findOne({
        email: email
    }, function(err, coach) {
        if (err)
            return Utils.errorIntern(res, err);

        if (!coach) {
            return res.json({
                success: false,
                msg: "Le coach n'a pas été trouvé"
            });
        } else {

            console.info(coach);
            //check si le mdp est le bon
            coach.comparePassword(password, function(err, isMatch) {
                if (isMatch && !err) {
                    let token = jwt.encode(coach, config.secret);
                    //increase total_connexion
                    coach.total_connexion++;
                    coach.save((err) => {
                        if (err)
                            return Utils.errorIntern(res, err);
                    });

                    return res.json({
                        success: true,
                        token: 'JWT ' + token,
                        coach: coach
                    });

                } else {
                    return res.json({
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
            return Utils.errorIntern(res, err);
        }

        coach.sport = sport;
        coach.save((err) => {
            if (err)
                return Utils.errorIntern(res, err);
        });

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
            return Utils.errorIntern(res, err);
        }

        let newTeam = new Team({
            name_club,
            category,
            division
        });

        coach.team = newTeam;

        coach.save((err) => {
            if (err)
                return Utils.errorIntern(res, err);
        });

        //create token for authentication jwt
        let token = jwt.encode(coach, config.secret);
        res.status(202).json({
            success: true,
            msg: 'Equipe ajouté',
            coach
        });

    });
};
