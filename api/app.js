'use strict'

let express = require('express')
let app = express()
let bodyParser = require('body-parser')
// TODO: a voir
let morgan = require('morgan')
let mongoose = require('mongoose')
let config = require('./config/database')
let port = process.env.PORT || 5000
let jwt = require('jwt-simple')
let cors = require('cors')

// connect to database
if (process.env.NODE_ENV === 'production') {
  // console.log(process.env.NODE_ENV)
  mongoose.connect(config.database_prod)
} else {
  console.log('dev')
  mongoose.connect(config.database_dev)
}

app.use(express.static(__dirname + '/public'))
// get our request parameters
// TODO: a voir
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

// log to console
app.use(morgan('dev'))

app.use(cors())

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true)

  // Pass to next layer of middleware
  next()
})

let apiRoutes = express.Router()

let auth = require('./routes/auth')
let user = require('./routes/user')
let coach = require('./routes/coach')
let statistics = require('./routes/statistics')
let team = require('./routes/team')
let match = require('./routes/match')
let player = require('./routes/player')
let clubs = require('./routes/clubs')
let football = require('./routes/football')
let sports = require('./routes/sports')

apiRoutes
  .use('/', auth)
  .use('/', user)
  .use('/', coach)
  .use('/', statistics)
  .use('/', team)
  .use('/', player)
  .use('/', match)
  .use('/', clubs)
  .use('/', football)
  .use('/', sports)

console.log('connected to port : ' + port)
app.use('/api', apiRoutes)

module.exports = app
