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
let port = process.env.PORT || 5000;
let jwt = require('jwt-simple');


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

            newCoach.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.json({
                        success: false,
                        msg: 'Username already exists'
                    });
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
    if (!req.body.last_name || !req.body.first_name || !req.body.password || !req.body.type || !req.body.sport || !req.body.country || !req.body.genre || !req.body.birth_date) {
        return res.json({
            success: false,
            msg: "Un ou plusieurs champs requis n'ont pas été remplis"
        });
    } else {
        console.log(req.body.birth_date);
        let newCoach = new Coach.modelCoach({
            last_name: req.body.last_name,
            first_name: req.body.first_name,
            password: req.body.password,
            email: req.body.email,
            connected: 'jwt',
            country: req.body.country,
            sport: req.body.sport,
            type: req.body.type,
            genre: req.body.genre,
            birth_date: req.body.birth_date,
            created_at: Date.now()
        });

        newCoach.team = new Team({
            name_club: req.body.name_club,
            category: req.body.category,
            division: req.body.division
        });


        newCoach.save(function(err) {
            if (err) {
                return res.json({
                    success: false,
                    msg: 'Username already exists'
                });
            }

            res.json({
                success: true,
                msg: 'Successful created new user'
            });
        });
    }
});

apiRoutes.post('/authenticate', function(req, res) {

    let email = req.body.email;
    let password = req.body.password;

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
                msg: 'Authentication failed. User not found'
            });
        } else {
            coach.comparePassword(password, function(err, isMatch) {
                if (isMatch && !err) {
                    let token = jwt.encode(coach, config.secret);

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

apiRoutes.post('/forgotPassword', controllerCoach.forgotPassword);
apiRoutes.post('/resetPassword', controllerCoach.resetPassword);
console.log('connected to port : ' + port);
app.use('/api', apiRoutes);
