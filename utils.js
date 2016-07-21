'use strict';

let mg = require('nodemailer-mailgun-transport');
let auth = require('./config/mailgun').auth;
let nodemailer = require('nodemailer');

exports.validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

exports.diffArray = (fstArray, sndArray) => {

    let diff = fstArray
        .filter(element => sndArray.indexOf(element) < 0)
        .concat(sndArray.filter(element => fstArray.indexOf(element) < 0));

    return diff;
};

exports.error = (res, msg) => {
    return res.status(400).json({
        success: false,
        msg
    });
}

exports.errorIntern = (res, err) => {

    console.error(err);

    let smtpTransport = nodemailer.createTransport(mg(auth));

    let mailOptionsOldMail = {
        to: 'sabinecaizergues@hotmail.com, ceul1barth@hotmail.fr',
        from: 'postmaster@sandbox23aac40875ed43708170487989939d3f.mailgun.org',
        subject: `Internal Server Error`,
        text: err
    };

    smtpTransport.sendMail(mailOptionsOldMail, (err) => {
        if (err)
            throw err;
    });

    return res.status(500).json({
      success: false,
      msg: `Internal Server Error`
    });
};

let actionMap = new Map();

actionMap.set('assist', 'passe décisive');
actionMap.set('ballPlayed', 'ballon joué');
actionMap.set('retrieveBalls', 'ballon récupéré');
actionMap.set('foulsSuffered', 'faute subie');
actionMap.set('foulsCommitted', 'faute commise');
actionMap.set('yellowCard', 'carton jaune');
actionMap.set('redCard', 'carton rouge');
actionMap.set('attemptsOnTarget', 'tir cadré');
actionMap.set('attemptsOffTarget', 'tir non cadré');
actionMap.set('attempts', 'tir');
actionMap.set('beforeAssist', 'avant dernière passe décisive');
actionMap.set('ballLost', 'ballon perdu');
actionMap.set('but', 'but');
actionMap.set('defensiveAction', 'geste défensif');
actionMap.set('passesCompletion', 'taux de passe réussie');
actionMap.set('relanceCompletion', 'taux de relance');
actionMap.set('offSide', 'hors-jeu');
actionMap.set('passesFailed', 'passe raté');
actionMap.set('crossesFailed', 'centre raté');
actionMap.set('saves', 'parade');
actionMap.set('sorties_aeriennes', 'sortie aérienne');
actionMap.set('clean_sheet', 'clean sheet');

exports.getAction = (key) => {
    return actionMap.get(key)
}
