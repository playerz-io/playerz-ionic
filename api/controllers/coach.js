'use strict'
//controller coach
var Coach = require('../models/coach').modelCoach
var config = require('../config/database')
var Team = require('../models/team').modelTeam
let async = require('async')
let crypto = require('crypto')
let nodemailer = require('nodemailer')
let mg = require('nodemailer-mailgun-transport')
let auth = require('../config/mailgun').auth

exports.getNameTeam = function(req, res) {

    let data = res.locals.data

    Coach.findById(data.id, function(err, coach) {
        if (err)
            return Utils.errorIntern(res, err)

        let nameTeam = coach.team.name_club

        res.status(202).json({
            success: true,
            nameTeam
        })
    })

}

exports.getCoachById = function (req, res) {
  let data = res.locals.data

  Coach.findById(data.id, function (err, coach) {
    if (err) {
      throw err
    }

    res.status(202).json({
      coach
    })
  })
}

exports.getCoach = function (req, res) {
  const data = res.locals.data
  const id = data.id

  Coach.findOne({_id: id}, function (err, coach) {
    if (err) {
      throw err
    }

    if (!coach) {
      return res.status(403).send({
        success: false,
        msg: 'Coach not found.'
      })
    } else {
      res.json({
        success: true,
        coach
      })
    }
  })
}

exports.updateCoach = function(req, res) {

    let first_name = req.body.first_name
    let last_name = req.body.last_name
    let country = req.body.country
    let description = req.body.description
    let birth_date = req.body.birth_date
    let website_club = req.body.website_club
    let website_perso = req.body.website_perso
    let data = res.locals.data

    Coach.findById(data.id, (err, coach) => {

        if (err)
            return Utils.errorIntern(res, err)

        coach.first_name = first_name
        coach.last_name = last_name
        coach.country = country
        coach.description = description
        coach.birth_date = birth_date
        coach.website_perso = website_perso
        coach.website_club = website_club

        coach.save((err) => {
            if (err)
                return Utils.errorIntern(res, err)
        })

        res.status(202).json({
            success: true,
            msg: 'coach updated',
            coach: coach
        })
    })
}
