'use strict';

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
//TODO: a voir
let morgan = require('morgan');
let mongoose = require('mongoose');
let passport = require('passport');
let config = require('./config/database');
let port = process.env.PORT || 5000;
let jwt = require('jwt-simple');


//connect to database
if (process.env.NODE_ENV === 'production') {
    //console.log(process.env.NODE_ENV);
    mongoose.connect(config.database_prod);
} else {
    console.log('dev');
    mongoose.connect(config.database_dev);
}


//get our request parameters
//TODO: a voir
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//log to console
app.use(morgan('dev'));

//Use the passport package in our application
app.use(passport.initialize());

app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
//Start server
app.listen(port);


//passport configuration
require('./config/passport')(passport);
//TODO: a voir
let apiRoutes = express.Router();

let auth = require('./routes/auth');
let user = require('./routes/user');
let coach = require('./routes/coach');
let statistics = require('./routes/statistics');
let team = require('./routes/team');
let match = require('./routes/match');
let player = require('./routes/player');
let clubs = require('./routes/clubs');
let football = require('./routes/football');

apiRoutes
    .use('/', auth)
    .use('/', user)
    .use('/', coach)
    .use('/', statistics)
    .use('/', team)
    .use('/', player)
    .use('/', match)
    .use('/', clubs)
    .use('/', football);

// //save token stripe
//
// apiRoutes.post('/stripe', passport.authenticate('jwt', {
//     session: false
// }), Payment.createTokenStripe);
//
// apiRoutes.post('/webhooks', (req, res) => {
//     var event_json = JSON.parse(request.body);
//     console.log(event_json);
//     stripe.events.retrieve(event_json.id, function(err, event) {
//         // Do something with event
//         console.log(event);
//         response.send(200);
//     });
// });

console.log('connected to port : ' + port);
app.use('/api', apiRoutes);
