'use strict';

let alsace = require('../sports/football/fff/ligueAlsace.json');
let aquitaine = require('../sports/football/fff/ligueAquitaine.json');
let atlantique = require('../sports/football/fff/ligueAtlantique.json');
let auvergne = require('../sports/football/fff/ligueAuvergne.json');
let basse_normandie = require('../sports/football/fff/ligueBasseNormandie.json');
let bourgogne = require('../sports/football/fff/ligueBourgogne.json');
let bretagne = require('../sports/football/fff/ligueBretagne.json');
let centre_ouest = require('../sports/football/fff/ligueCentreOuest.json');
let centre_val_de_loire = require('../sports/football/fff/ligueCentreValDeLoire.json');
let champagne_ardennne = require('../sports/football/fff/ligueChampagneArdenne.json');
let corse = require('../sports/football/fff/ligueCorse.json');
let maine = require('../sports/football/fff/ligueDuMaine.json');
let languedoc_roussillon = require('../sports/football/fff/ligueLanguedocRoussillon.json');
let lorraine = require('../sports/football/fff/ligueLorraine.json');
let mediterreanee = require('../sports/football/fff/ligueMediterreanée.json');
let nord_pas_de_calais = require('../sports/football/fff/ligueNordPasDeCalais.json');
let normandie = require('../sports/football/fff/ligueNormandie.json');
let ile_de_france = require('../sports/football/fff/ligueParisIleDeFrance.json');
let picardie = require('../sports/football/fff/liguePicardie.json');
let rhone_alpes = require('../sports/football/fff/ligueRhoneAlpes.json');
let val_de_loire = require('../sports/football/fff/ligueValDeLoire.json');


let club =  [].concat(alsace, aquitaine, atlantique, auvergne, basse_normandie, bourgogne, bretagne, centre_ouest, centre_val_de_loire, champagne_ardennne, corse, maine, languedoc_roussillon, lorraine, mediterreanee, nord_pas_de_calais, normandie, ile_de_france, picardie, rhone_alpes, val_de_loire);

exports.getNameClub = (req, res) => {

    let arrayNameClub = club.map((club) => {
        return club.nomClub;
    });

    return res.json({
        arrayNameClub
    });
};
