'use strict'

var define = require('node-constants')(exports);

define({
    FOOTBALL: 'Football',
    QQDEUX: '4-4-2',
    GD: 'Gardien',
    NUMBER_GD: 1,
    NUMBER_FIRST_PLAYER: 11,
    DEF: 'Défenseur',
    AR: 'Arrière Latéral',
    MD: 'Milieu Défensif',
    MO: 'Milieu Offensif',
    AI: 'Ailier',
    AV: 'Avant-Centre',
    QQDEUX_POST: [{
        post: 'GD'
    },
    {
        post: 'ARD'
    },
    {
        post: 'ARG'
    },
    {
        post: 'DFG'
    },
    {
        post: 'DFD'
    },
    {
        post: 'MCD'
    },
    {
        post: 'MCG'
    },
    {
        post: 'MD'
    },
    {
        post: 'MG'
    },
    {
        post: 'ATD'
    },
    {
        post: 'ATG'
    },
    {
        post: 'REM'
    }],
    QTTROIS_POST: [{
        post: 'GD'
    }, {
        post: 'ARD'
    }, {
        post: 'ARG'
    }, {
        post: 'DFG'
    }, {
        post: 'DFD'
    }, {
        post: 'MC'
    }, {
        post: 'MCG'
    }, {
        post: 'MCD'
    }, {
        post: 'AV'
    }, {
        post: 'ATD'
    }, {
        post: 'ATG'
    }, {
        post: 'REM'
    }]

});
