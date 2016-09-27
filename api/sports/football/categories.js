'use strict';

let getCategoriesFoot = () => {
    let categories = [];
    for (let i = 7; i < 21; i++) {
        categories.push('U' + i);
    }
    categories.push('Sénior', 'Vétéran');
    return categories;
};

exports.getCategoriesFoot = (req, res) => {
    res.status(200).json({
        categories: getCategoriesFoot()
    });
};


let frenchDivision = [{
    name: 'Ligue 1'
}, {
    name: 'Ligue 2'
}, {
    name: 'National'
}, {
    name: 'CFA'
}, {
    name: 'CFA2'
}, {
    name: 'Division d\'Honneur'
}, {
    name: 'Excellence'
}, {
    name: 'Promotion d\'Excellence'
}, {
    name: 'Promotion'
}, {
    name: 'Promotion Honneur'
}, {
    name: 'Régional 1'
}, {
    name: 'Régional 2'
}, {
    name: 'Régional 3'
}, {
    name: 'Régional 4'
}, {
    name: 'Division Régionale Supérieure'
}, {
    name: 'Division Régionale Honneur'
}, {
    name: 'Division Honneur Régionale'
}, {
    name: 'Promotion Honneur Régionale'
}, {
    name: 'Elite'
}, {
    name: 'Promotion de ligue'
}, {
    name: 'Division Supérieure Régionale'
}, {
    name: 'Honneur Ligue'
}, {
    name: 'Promotion Ligue'
}, {
    name: 'Division Supérieure Élite'
}, {
    name: 'Division Supérieure Régionale'
}, {
    name: 'Promotion Honneur A'
}, {
    name: 'Promotion Honneur B'
}, {
    name: 'Promotion Honneur C'
}, {
    name: 'Ligue Régionale 2'
}, {
    name: 'Ligue Régionale 3'
}, {
    name: 'Division Supérieure'
}, {
    name: 'Elite'
}, {
    name: 'Promotion Interdistricts'
}, {
    name: 'Première division'
}, {
    name: 'D1 Régionale'
}, {
    name: 'D2 Régionale'
}, {
    name: 'D2 Départementale'
}, {
    name: 'D3 Départementale'
}, {
    name: 'Excellence A'
}, {
    name: 'Promotion Excellence A'
}, {
    name: 'Promotion d\'Honneur A'
}, {
    name: 'Promotion d\'Honneur B'
}, {
    name: 'Promotion A'
}, {
    name: 'Division 1 A'
}, {
    name: 'Division 2 A'
}, {
    name: 'Division 3 A'
}, {
    name: 'Promotion B'
}, {
    name: 'Division 1 B'
}, {
    name: 'Division 2 B'
}, {
    name: 'Division 3 B'
}, {
    name: 'Division 1'
}, {
    name: 'Promotion Division 1'
}, {
    name: 'Promotion Division 2'
}, {
    name: 'Division 2'
}, {
    name: 'Départementale 1'
}, {
    name: 'Départementale 2'
}, {
    name: 'Départementale 3'
}, {
    name: 'Départementale 4'
}, {
    name: 'Départementale 5'
}, {
    name: 'Division 4'
}, {
    name: 'Division 3'
}, {
    name: 'Division 5'
}, {
    name: 'Division Supérieure'
}, {
    name: 'Division 6'
}, {
    name: '1ère Division'
}, {
    name: 'Promotion 1ère Division'
}, {
    name: 'Promotion 2ème Division'
}, {
    name: '2ème Division'
}, {
    name: '1ère Série'
}, {
    name: '2ème Division'
}, {
    name: '3ème Division'
}, {
    name: 'Promotion 1ère Série'
}, {
    name: '2ème Série'
}, {
    name: '3ème Série'
}, {
    name: '4ème Division'
}, {
    name: '5ème Division'
}, {
    name: 'Préligue'
}, {
    name: 'Seniors 1ère réserves'
}, {
    name: 'Seniors 2ème réserves'
}, {
    name: 'Honneur'
}, {
    name: 'Espoir'
}];

exports.getFrenchDivisionFoot = (req, res) => {
    let _frenchDivision = frenchDivision.map((item) => item.name);

    res.status(200).json({
        _frenchDivision
    })
};
