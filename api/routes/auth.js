'use strict'

let express = require('express')
let router = express.Router()
let controllerAuth = require('../controllers/auth')

router
    .post('/facebook', controllerAuth.facebookConnect)
    .post('/signup', controllerAuth.signup)
    .post('/signIn', controllerAuth.signIn)
    .post('/addSportFacebookUser', controllerAuth.addSportFacebookUser)
    .post('/addTeamFacebookUser', controllerAuth.addTeamFacebookUser)
    .post('/checkEmail', controllerAuth.checkEmail)
    .post('/checkPassword', controllerAuth.checkPassword)

module.exports = router
