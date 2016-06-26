'use strict';

let http = require('http');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let morgan = require('morgan');
let mongoose = require('mongoose');
let passport = require('passport');
let config = require('./config/database');
let Coach = require('./models/coach');
let Team = require('./models/team').modelTeam;
let controllerCoach = require('./controllers/coach');
let controllerTeam = require('./controllers/team');
let controllerMatch = require('./controllers/match');
let controllerPlayer = require('./controllers/player');
let controllerStat = require('./controllers/statistics');
let controllerFirebase = require('./real_time');

let Payment = require('./controllers/payment');
let port = process.env.PORT || 5000;
let jwt = require('jwt-simple');
let Utils = require('./utils');


//connect to database
if (process.env.NODE_ENV === 'production') {
    mongoose.connect(config.database_prod);
} else {
    mongoose.connect(config.database_dev);
}


//get our request parameters
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



let apiRoutes = express.Router();


//auth with facebook
apiRoutes.post('/facebook', function(req, res) {



    Coach.modelCoach.findOne({
        id_facebook: req.body.id_facebook
    }, (err, coach) => {
        if (err)
            throw err;

        //increase total_connexion
        coach.total_connexion++;

        if (!coach) {
            let newCoach = new Coach.modelCoach({
                last_name: req.body.last_name,
                first_name: req.body.first_name,
                connected: 'facebook',
                email: req.body.email,
                country: req.body.country,
                type: req.body.type,
                genre: req.body.genre,
                birth_date: req.body.birth_date,
                id_facebook: req.body.id_facebook,
                created_at: Date.now()
            });

            //increase total_connexion
            newCoach.total_connexion++;
            newCoach.save(function(err) {
                if (err) {
                    throw err;
                }
            });

            let token = jwt.encode(newCoach, config.secret);
            return res.json({
                success: true,
                msg: 'Successful created new user',
                token: 'JWT ' + token,
                newCoach
            });
        }
        let token = jwt.encode(coach, config.secret);
        return res.json({
            success: true,
            coach,
            token: 'JWT ' + token
        });
    });

});

apiRoutes.post('/signup', function(req, res) {

    let last_name = req.body.last_name;
    let first_name = req.body.first_name;
    let password = req.body.password;
    let email = req.body.email;
    let country = req.body.country;
    let sport = req.body.sport;
    let type = req.body.type;
    let genre = req.body.genre;
    let birth_date = req.body.birth_date;
    let name_club = req.body.name_club;
    let category = req.body.category;
    let division = req.body.division;

    //validation email
    if (!Utils.validateEmail(email)) {
        return res.json({
            success: false,
            msg: "Respecter le format d'une addresse mail"
        });
    }

    if (!last_name || !first_name || !password || !type || !sport || !country || !genre || !birth_date || !name_club || !category || !division) {
        return res.status(400).json({
            success: false,
            msg: "Un ou plusieurs champs requis n'ont pas été remplis"
        });
    } else {

        Coach.modelCoach.findOne({
            email
        }, (err, coach) => {
            if (!coach) {
                let newCoach = new Coach.modelCoach({
                    last_name,
                    first_name,
                    password,
                    email,
                    connected: 'jwt',
                    country,
                    sport,
                    type,
                    genre,
                    birth_date,
                    created_at: Date.now(),
                    total_connexion: 0
                });

                newCoach.team = new Team({
                    name_club,
                    category,
                    division
                });


                newCoach.save(function(err) {
                    if (err)
                        throw err;

                    res.json({
                        success: true,
                        msg: 'Successful created new user'
                    });
                });
            } else {
              return res.json({
                success: false,
                msg: 'Un coach existe déjà avec cette addresse mail'
              })
            }

        });


    }
});

apiRoutes.post('/authenticate', function(req, res) {

    let email = req.body.email;
    let password = req.body.password;

    //validate email
    if (!Utils.validateEmail(email)) {
        return res.json({
            success: false,
            msg: "Respecter le format d'une addresse mail"
        });
    }

    if (!email.toString() || !password.toString()) {
        return res.json({
            success: false,
            msg: "Les champs email ou mot de passe sont vides !"
        });
    }

    Coach.modelCoach.findOne({
        email: email
    }, function(err, coach) {
        if (err)
            throw err;

        if (!coach) {
            return res.json({
                success: false,
                msg: "Le coach n'a pas été trouvé"
            });
        } else {
            coach.comparePassword(password, function(err, isMatch) {
                if (isMatch && !err) {
                    let token = jwt.encode(coach, config.secret);

                    //increase total_connexion
                    coach.total_connexion++;
                    coach.save();

                    res.json({
                        success: true,
                        token: 'JWT ' + token,
                        coach: coach
                    });

                } else {
                    return res.json({
                        success: false,
                        msg: 'Authentication failed. Wrong password'
                    });
                }
            });
        }
    });
});

//get coach
apiRoutes.get('/coach', passport.authenticate('jwt', {
    session: false
}), controllerCoach.getCoach);

apiRoutes.get('/coach_by_id', passport.authenticate('jwt', {
    session: false
}), controllerCoach.getCoachById);

apiRoutes.put('/coach', passport.authenticate('jwt', {
    session: false
}), controllerCoach.updateCoach);


/*********** PLAYER ****************/
//add Player to Team
apiRoutes.post('/player', passport.authenticate('jwt', {
    session: false
}), controllerTeam.addPlayer);

//get players
apiRoutes.get('/players', passport.authenticate('jwt', {
    session: false
}), controllerTeam.getPlayers);

//get Player by Id
apiRoutes.get('/player/:id', passport.authenticate('jwt', {
    session: false
}), controllerTeam.getPlayerById);

//remove player
apiRoutes.delete('/player', passport.authenticate('jwt', {
    session: false
}), controllerTeam.removePlayer);


/************ MATCH *****************/

//add match
apiRoutes.post('/match', passport.authenticate('jwt', {
    session: false
}), controllerMatch.addMatch);

//get matchs
apiRoutes.get('/matchs', passport.authenticate('jwt', {
    session: false
}), controllerMatch.getMatchs);

//get matchs by id
apiRoutes.get('/match/:id', passport.authenticate('jwt', {
    session: false
}), controllerMatch.getMatchById);

//remove match
apiRoutes.delete('/match', passport.authenticate('jwt', {
    session: false
}), controllerMatch.removeMatch);

//add formation
apiRoutes.post('/formation', passport.authenticate('jwt', {
    session: false
}), controllerMatch.addFormation);

//get post tactique
apiRoutes.get('/tactique', passport.authenticate('jwt', {
    session: false
}), controllerMatch.getTactique);

//add selected_player
apiRoutes.post('/player_selected', passport.authenticate('jwt', {
    session: false
}), controllerMatch.addPlayerSelected);

//Get player selected
apiRoutes.get('/player_selected', passport.authenticate('jwt', {
    session: false
}), controllerMatch.getPlayerSelected);

apiRoutes.delete('/player_selected', passport.authenticate('jwt', {
    session: false
}), controllerMatch.removePlayerSelected);

apiRoutes.get('/player_no_selected', passport.authenticate('jwt', {
    session: false
}), controllerMatch.getPlayerNoSelected);

//get match comeup
apiRoutes.get('/match_finished', passport.authenticate('jwt', {
    session: false
}), controllerMatch.findMatchFinished);

//get match comeup
apiRoutes.get('/match_comeup', passport.authenticate('jwt', {
    session: false
}), controllerMatch.findMatchComeUp);



/************** PLAYER **************/

//add position to playerSelected
apiRoutes.post('/position', passport.authenticate('jwt', {
    session: false
}), controllerPlayer.addPosition);

/******* UPDATE **********/

apiRoutes.post('/statistic', passport.authenticate('jwt', {
    session: false
}), controllerStat.updateStatistic);

// push schema
apiRoutes.post('/schema', passport.authenticate('jwt', {
    session: false
}), controllerStat.addPlayerSchema);

apiRoutes.post('/action', passport.authenticate('jwt', {
    session: false
}), controllerStat.countMainAction);

apiRoutes.post('/avgRelance', passport.authenticate('jwt', {
    session: false
}), controllerStat.avgRelance);

apiRoutes.post('/countPercent', passport.authenticate('jwt', {
    session: false
}), controllerStat.countPercent);

apiRoutes.get('/nameTeam', passport.authenticate('jwt', {
    session: false
}), controllerCoach.getNameTeam);

apiRoutes.post('/totalStat', passport.authenticate('jwt', {
    session: false
}), controllerStat.totalStat);

apiRoutes.get('/getMatchPlayed', passport.authenticate('jwt', {
    session: false
}), controllerPlayer.getMatchPlayed);

apiRoutes.get('/getStatisticsMatch', passport.authenticate('jwt', {
    session: false
}), controllerPlayer.getStatisticsMatch);

apiRoutes.post('/addSportFacebookUser', passport.authenticate('jwt', {
    session: false
}), controllerCoach.addSportFacebookUser);

apiRoutes.post('/addTeamFacebookUser', passport.authenticate('jwt', {
    session: false
}), controllerCoach.addTeamFacebookUser);

apiRoutes.post('/defaultPosition', passport.authenticate('jwt', {
    session: false
}), controllerMatch.defaultPosition);

apiRoutes.post('/switchPosition', passport.authenticate('jwt', {
    session: false
}), controllerMatch.switchPosition);


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

apiRoutes.post('/forgotPassword', controllerCoach.forgotPassword);
apiRoutes.post('/resetPassword', controllerCoach.resetPassword);
console.log('connected to port : ' + port);
app.use('/api', apiRoutes);
