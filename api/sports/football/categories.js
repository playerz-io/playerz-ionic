'use strict'

let getCategoriesFoot = () => {
    let categories = [];
    for (let i = 7; i < 21; i++) {
        categories.push('U' + i);
    }
    categories.push('Sénior', 'Vétéran');
    return categories;
}

exports.getCategoriesFoot = (req, res) => {
    res.status(200).json({
        categories: getCategoriesFoot()
    });
}


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
    }


];

exports.getFrenchDivisionFoot = (req, res) => {
    let _frenchDivision = frenchDivision.map((item) => item.name);

    res.status(200).json({
      _frenchDivision
    })
};
