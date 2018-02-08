'use strict'

const async = require('async')
const Coach = require('../models/coach').modelCoach
const Utils = require('../utils')
const config = require('../config/database')
const Team = require('../models/team').modelTeam
const jwt = require('jwt-simple')
const nodemailer = require('nodemailer')
const mg = require('nodemailer-mailgun-transport')
const auth = require('../config/mailgun').auth
const mailTemplate = require('../templates/mail').template
const STATUS = require('../helpers/status')

let _checkPassword = (confirmationPassword, password, res) => {
  if (password) {
    if (confirmationPassword.length < 6 || password.length < 6) {
      return res.status(404).json({
          success: false,
          msg: 'Votre mot de passe doit contenir au moins 6 caractères'
      })
    }

    if (confirmationPassword !== password) {
      return res.status(404).json({
        success: false,
        msg: 'Le mot de passe et la confirmation sont différents'
      })
    }
  } else {
    return res.status(404).json({
        success: false,
        msg: "Ajoutez un mot de passe"
    })
  }

  res.status(200).json({
      success: true
  })
}

let _checkEmail = (email, res) => {
  if (email) {
      if (!Utils.validateEmail(email)) {
          return res.status(404).json({
              success: false,
              msg: "Respecter le format d'une adresse mail"
          })
      }
  } else {
      return res.status(404).json({
          success: false,
          msg: "Ajoutez une adresse mail"
      })
  }

  res.status(200).json({
      success: true
  })
}

exports.checkPassword = (req, res) => {

  let password = req.body.password
  let confirmation_password = req.body.confirmation_password

  _checkPassword(confirmation_password, password, res)

}

exports.checkEmail = (req, res) => {
  let email = req.body.email
  console.log(email)
  _checkEmail(email, res)

}

let mailSubscription = (last_name, first_name, email, res) => {

  let smtpTransport = nodemailer.createTransport(mg(auth))
  let mailOptions = {
      to: email,
      from: '"Playerz" <support@playerz.io>',
      subject: 'Bienvenue sur Playerz',
      text: `Bonjour ${first_name},

Bienvenue sur Playerz

Merci d'avoir choisi Playerz, nous esperons que nos services vous aideront à améliorer vos performances.

Vous avez des questions ? Prenez contact avec nous via Facebook ou Twitter, ou email. Notre équipe sera toujours là pour vous coacher!

A bientôt,

Playerz Team`,
      html: mailTemplate(first_name, `Merci d'avoir choisi Playerz, nous esperons que nos services vous aideront à améliorer vos performances.
      <br>
      <br>
      Vous avez des questions?
      Prenez contact avec nous via <a target='_blank' href="https://www.facebook.com/wwwplayerzio/">Facebook</a>
      ou <a target='_blank' href="https://twitter.com/playerz_io">Twitter</a>,
      ou <a href='mailto:contact@playerz.io'>email</a>.
      Notre équipe sera toujours là pour vous coacher!
`, 'Bienvenue sur Playerz')

  }

  smtpTransport.sendMail(mailOptions, (err) => {


      if (err)
          return Utils.errorIntern(res, err)

  })
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

  let last_name = req.body.last_name
  let first_name = req.body.first_name
  let email = req.body.email
  let country = req.body.country
  let type = req.body.type
  let genre = req.body.genre
  let birth_date = req.body.birth_date
  let id_facebook = req.body.id_facebook

  async.waterfall([
      (done) => {
          // TODO: not equals facebook à revoir
          // NOTE: 1
          Coach.findOne({
              email,
              connected: 'jwt'
          }, (err, coach) => {
              if (err) {
                  return Utils.errorIntern(res, err)
              }
              if (coach) {
                  //TODO: trouver le bon code erreur correspondnat
                  return res.status(400).json({
                      msg: `Un utilisateur avec l'adresse que vous
                      utilisé pour votre compte facebook existe déjà`
                  })
              } else {
                  done(null)
              }
          })
      },

      (done) => {
          Coach.findOne({
              id_facebook
          }, (err, coach) => {
              if (err)
                  return Utils.errorIntern(res, err)

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
                  })

                  mailSubscription(last_name, first_name, email, res)
                  //increase total_connexion
                  newCoach.total_connexion++
                  newCoach.save(function(err) {
                      if (err) {
                          return Utils.errorIntern(res, err)
                      }
                  })

                  let token = jwt.encode(newCoach, config.secret)
                  return res.status(200).json({
                      success: true,
                      msg: 'Nouvel utilisateur crée',
                      token: 'JWT ' + token,
                      coach: newCoach
                  })
              } else {
                  //increase total_connexion
                  coach.total_connexion++
                  coach.save((err) => {
                      if (err)
                          return Utils.errorIntern(res, err)
                  })

              }
              let token = jwt.encode(coach, config.secret)
              return res.status(200).json({
                  success: true,
                  coach,
                  token: 'JWT ' + token
              })
          })
      }
  ])
}

const validEmail = (email, response) => {
  if (!Utils.validateEmail(email)) {
    return response.json({
      error: {
        code: 400,
        message: 'Invalid format email',
        status: STATUS.INVALID_ARGUMENT,
        details: [{
          message: 'Respecter le format d\'une adresse mail'
        }]
      }
    })
  }
}

const confirmPassword = (password, confirmationPassword, response) => {
  console.log(password, confirmPassword)
  if (confirmationPassword.length < 6 || password.length < 6) {
    return response.json({
      success: false,
      msg: 'Votre mot de passe doit contenir au moins 6 caractères'
    })
  }

  if (confirmationPassword !== password) {
    return response.json({
      success: false,
      msg: 'Le mot de passe et la confirmation sont différents'
    })
  }
}

const missingFields = () => {
const args = Array.from(arguments)
const isFalsyArgs = !args.some(element => element === false)
  return res.json({
    success: false,
    msg: "Un ou plusieurs champs requis n'ont pas été remplis"
  })
}

exports.signup = (req, res) => {
  const lastname = req.body.lastname
  const firstname = req.body.firstname
  const password = req.body.password
  const confirmationPassword = req.body.confirmation_password
  const email = req.body.email
  const country = req.body.country
  const sport = req.body.sport
  const type = req.body.type
  const genre = req.body.genre
  const birthdate = req.body.birthdate
  const nameClub = req.body.name_club
  const category = req.body.category
  const division = req.body.division

  if (email) {
    validEmail(email, res)
  }

  if (password) {
    confirmPassword(password, confirmationPassword, res)
  }

  if (!lastname || !email || !firstname || !password || !sport || !country ||
     !genre || !birthdate || !nameClub || !category || !division || !confirmationPassword) {
    return res.json({
      error: {
        code: 400,
        message: 'Missing required fields',
        status: STATUS.INVALID_ARGUMENT,
        details: [{
          message: 'Un ou plusieurs champs requis n\'ont pas été remplis'
        }]
      }
    })
  } else {
    Coach.findOne({
      email
    }, (err, coach) => {
      if (err) {
        return Utils.errorIntern(res, err)
      }
      // si le coach n'existe pas deja ds la bdd
      if (!coach) {
        // creation du coach
        let newCoach = new Coach({
          lastname,
          firstname,
          password,
          email,
          connected: 'jwt',
          country,
          sport,
          type,
          genre,
          birthdate: new Date(birthdate),
          created_at: Date.now(),
          total_connexion: 0
        })

        mailSubscription(lastname, firstname, email, res)

        // creation de son equipe
        newCoach.team = new Team({
          nameClub,
          category,
          division
        })

        newCoach.save(function (err) {
          if (err) {
            return Utils.errorIntern(res, err)
          }

          return res.json({
            status: 'ok',
            code: 201,
            message: 'Votre profil à été crée'
          })
        })
      } else {
        return res.json({
          error: {
            code: 409,
            message: `User ${email} already exists.`,
            status: STATUS.ALREADY_EXISTS,
            details: [{
              message: 'Un coach existe déjà avec cette adresse mail'
            }]
          }
        })
      }
    })
  }
}

// authentication with jwt
exports.authenticationJwt = (req, res) => {

  let email = req.body.email
  let password = req.body.password

  if (email) {
      if (!Utils.validateEmail(email)) {
          return res.json({
              success: false,
              msg: "Respecter le format d'une adresse mail"
          })
      }
  }

  if (!email || !password) {
      return res.json({
          success: false,
          msg: "Les champs email ou mot de passe ne sont pas remplis !"
      })
  }
  //recherche d'un coach par son email
  Coach.findOne({
      email: email
  }, function(err, coach) {
      if (err)
          return Utils.errorIntern(res, err)

      if (!coach) {
          return res.json({
              success: false,
              msg: "Le coach n'a pas été trouvé"
          })
      } else {

          //check si le mdp est le bon
          coach.comparePassword(password, function(err, isMatch) {
              if (isMatch && !err) {

                  //encode id, password & email coach
                  let data = new Object()
                  data.id = coach._id
                  data.email = coach.email
                  data.password = coach.password

                  console.log(coach, data)
                  let token = jwt.encode({data}, config.secret)


                  //increase total_connexion
                  coach.total_connexion++
                  coach.save((err) => {
                      if (err)
                          return Utils.errorIntern(res, err)
                  })

                  return res.json({
                      success: true,
                      token: 'JWT ' + token,
                      coach: coach
                  })

              } else {
                  return res.json({
                      success: false,
                      msg: `Votre mot de passe n'est pas correct`
                  })
              }
          })
      }
  })
}

exports.addSportFacebookUser = (req, res) => {
  let sport = req.body.sport
  let coach_id = req.body.coach_id

  if (!sport) {
      return res.status(400).json({
          success: false,
          msg: 'Choisissez un sport !!!'
      })
  }

  Coach.findById(coach_id, (err, coach) => {

      if (err) {
          return Utils.errorIntern(res, err)
      }

      coach.sport = sport
      coach.save((err) => {
          if (err)
              return Utils.errorIntern(res, err)
      })

      res.status(202).json({
          success: true,
          msg: 'Sport ajouté',
          coach
      })
  })
}

exports.addTeamFacebookUser = (req, res) => {

  let name_club = req.body.name_club
  let category = req.body.category
  let division = req.body.division
  let coach_id = req.body.coach_id


  if (!name_club || !category || !division) {
      return res.status(400).json({
          success: false,
          msg: "Un ou plusieurs champs requis n'ont pas été remplis"
      })
  }

  Coach.findById(coach_id, (err, coach) => {

      if (err) {
          return Utils.errorIntern(res, err)
      }

      let newTeam = new Team({
          name_club,
          category,
          division
      })

      coach.team = newTeam

      coach.save((err) => {
          if (err)
              return Utils.errorIntern(res, err)
      })

      //create token for authentication jwt
      let token = jwt.encode(coach, config.secret)
      res.status(202).json({
          success: true,
          msg: 'Equipe ajouté',
          coach
      })

  })
}
