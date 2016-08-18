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


let countries = [
     "Afghanistan",
     "Afrique du Sud",
     "Albanie",
     "Algérie",
     "Allemagne",
     "Andorre",
     "Angola",
     "Anguilla",
     "Antarctique",
     "Antigua-et-Barbuda",
     "Antilles néerlandaises",
     "Arabie saoudite",
     "Argentine",
     "Arménie",
     "Aruba",
     "Australie",
     "Autriche",
     "Azerbaïdjan",
     "Bahamas",
     "Bahreïn",
     "Bangladesh",
     "Barbade",
     "Bélarus",
     "Belgique",
     "Belize",
     "Bénin",
     "Bermudes",
     "Bhoutan",
     "Bolivie",
     "Bosnie-Herzégovine",
     "Botswana",
     "Brésil",
     "Brunéi Darussalam",
     "Bulgarie",
     "Burkina Faso",
     "Burundi",
     "Cambodge",
     "Cameroun",
     "Canada",
     "Cap-Vert",
     "Ceuta et Melilla",
     "Chili",
     "Chine",
     "Chypre",
     "Colombie",
     "Comores",
     "Congo-Brazzaville",
     "Corée du Nord",
     "Corée du Sud",
     "Costa Rica",
     "Côte d’Ivoire",
     "Croatie",
     "Cuba",
     "Danemark",
     "Diego Garcia",
     "Djibouti",
     "Dominique",
     "Égypte",
     "El Salvador",
     "Émirats arabes unis",
     "Équateur",
     "Érythrée",
     "Espagne",
     "Estonie",
     "État de la Cité du Vatican",
     "États fédérés de Micronésie",
     "États-Unis",
     "Éthiopie",
     "Fidji",
     "Finlande",
     "France",
     "Gabon",
     "Gambie",
     "Géorgie",
     "Géorgie du Sud et les îles Sandwich du Sud",
     "Ghana",
     "Gibraltar",
     "Grèce",
     "Grenade",
     "Groenland",
     "Guadeloupe",
     "Guam",
     "Guatemala",
     "Guernesey",
     "Guinée",
     "Guinée équatoriale",
     "Guinée-Bissau",
     "Guyana",
     "Guyane française",
     "Haïti",
     "Honduras",
     "Hongrie",
     "Île Bouvet",
     "Île Christmas",
     "Île Clipperton",
     "Île de l'Ascension",
     "Île de Man",
     "Île Norfolk",
     "Îles Åland",
     "Îles Caïmans",
     "Îles Canaries",
     "Îles Cocos - Keeling",
     "Îles Cook",
     "Îles Féroé",
     "Îles Heard et MacDonald",
     "Îles Malouines",
     "Îles Mariannes du Nord",
     "Îles Marshall",
     "Îles Mineures Éloignées des États-Unis",
     "Îles Salomon",
     "Îles Turks et Caïques",
     "Îles Vierges britanniques",
     "Îles Vierges des États-Unis",
     "Inde",
     "Indonésie",
     "Irak",
     "Iran",
     "Irlande",
     "Islande",
     "Israël",
     "Italie",
     "Jamaïque",
     "Japon",
     "Jersey",
     "Jordanie",
     "Kazakhstan",
     "Kenya",
     "Kirghizistan",
     "Kiribati",
     "Koweït",
     "Laos",
     "Lesotho",
     "Lettonie",
     "Liban",
     "Libéria",
     "Libye",
     "Liechtenstein",
     "Lituanie",
     "Luxembourg",
     "Macédoine",
     "Madagascar",
     "Malaisie",
     "Malawi",
     "Maldives",
     "Mali",
     "Malte",
     "Maroc",
     "Martinique",
     "Maurice",
     "Mauritanie",
     "Mayotte",
     "Mexique",
     "Moldavie",
     "Monaco",
     "Mongolie",
     "Monténégro",
     "Montserrat",
     "Mozambique",
     "Myanmar",
     "Namibie",
     "Nauru",
     "Népal",
     "Nicaragua",
     "Niger",
     "Nigéria",
     "Niue",
     "Norvège",
     "Nouvelle-Calédonie",
     "Nouvelle-Zélande",
     "Oman",
     "Ouganda",
     "Ouzbékistan",
     "Pakistan",
     "Palaos",
     "Panama",
     "Papouasie-Nouvelle-Guinée",
     "Paraguay",
     "Pays-Bas",
     "Pérou",
     "Philippines",
     "Pitcairn",
     "Pologne",
     "Polynésie française",
     "Porto Rico",
     "Portugal",
     "Qatar",
     "R.A.S. chinoise de Hong Kong",
     "R.A.S. chinoise de Macao",
     "régions éloignées de l’Océanie",
     "République centrafricaine",
     "République démocratique du Congo",
     "République dominicaine",
     "République tchèque",
     "Réunion",
     "Roumanie",
     "Royaume-Uni",
     "Russie",
     "Rwanda",
     "Sahara occidental",
     "Saint-Barthélémy",
     "Saint-Kitts-et-Nevis",
     "Saint-Marin",
     "Saint-Martin",
     "Saint-Pierre-et-Miquelon",
     "Saint-Vincent-et-les Grenadines",
     "Sainte-Hélène",
     "Sainte-Lucie",
     "Samoa",
     "Samoa américaines",
     "Sao Tomé-et-Principe",
     "Sénégal",
     "Serbie",
     "Serbie-et-Monténégro",
     "Seychelles",
     "Sierra Leone",
     "Singapour",
     "Slovaquie",
     "Slovénie",
     "Somalie",
     "Soudan",
     "Sri Lanka",
     "Suède",
     "Suisse",
     "Suriname",
     "Svalbard et Île Jan Mayen",
     "Swaziland",
     "Syrie",
     "Tadjikistan",
     "Taïwan",
     "Tanzanie",
     "Tchad",
     "Terres australes françaises",
     "Territoire britannique de l'océan Indien",
     "Territoire palestinien",
     "Thaïlande",
     "Timor oriental",
     "Togo",
     "Tokelau",
     "Tonga",
     "Trinité-et-Tobago",
     "Tristan da Cunha",
     "Tunisie",
     "Turkménistan",
     "Turquie",
     "Tuvalu",
     "Ukraine",
     "Union européenne",
     "Uruguay",
     "Vanuatu",
     "Venezuela",
     "Viêt Nam",
     "Wallis-et-Futuna",
     "Yémen",
     "Zambie",
     "Zimbabwe"
];

exports.getCountries = (req, res) => {
  res.status(200).json(countries);
}
