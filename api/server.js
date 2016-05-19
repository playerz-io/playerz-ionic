var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database');
var Coach = require('./models/coach');
var Team = require('./models/team').modelTeam;
var controllerCoach = require('./controllers/coach');
var controllerTeam = require('./controllers/team');
var controllerMatch = require('./controllers/match');
var controllerPlayer = require('./controllers/player');
var controllerStat = require('./controllers/statistics');
var port = process.env.PORT || 5000;
var jwt = require('jwt-simple');

//connect to database
if(process.env.NODE_ENV === 'production'){
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
app.use(morgan('dev'))

//Use the passport package in our application
app.use(passport.initialize());


//Start server
app.listen(port);


//passport configuration
require('./config/passport')(passport);



var apiRoutes = express.Router();


//auth with facebook
apiRoutes.post('/facebook', function(req, res) {

    var newCoach = new Coach.modelCoach({
        last_name: req.body.last_name,
        first_name: req.body.first_name,
        connected: 'facebook'
    });

    newCoach.save(function(err) {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                msg: 'Username already exists'
            })
        }
    });

    var token = jwt.encode(newCoach, config.secret);
    res.json({
        success: true,
        msg: 'Successful created new user',
        token: 'JWT ' + token,
        newCoach: newCoach
    });


});

apiRoutes.post('/signup', function(req, res) {
    if (!req.body.last_name || !req.body.first_name || !req.body.password || !req.body.type || !req.body.sport || !req.body.country || !req.body.genre) {
        res.json({
            sucess: false,
            msg: "Un ou plusieurs champs n'ont pas été remplis"
        });
    } else {
        var newCoach = new Coach.modelCoach({
            last_name: req.body.last_name,
            first_name: req.body.first_name,
            password: req.body.password,
            email: req.body.email,
            connected: 'jwt',
            country: req.body.country,
            sport: req.body.sport,
            type: req.body.type,
            genre: req.body.genre,
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
                })
            }

            res.json({
                success: true,
                msg: 'Successful created new user'
            });
        });
    }
});

apiRoutes.post('/authenticate', function(req, res) {

    Coach.modelCoach.findOne({
        email: req.body.email
    }, function(err, coach) {
        if (err)
            throw err;

        if (!coach) {
            res.send({
                success: false,
                msg: 'Authentication failed. User not found'
            });
        } else {
            coach.comparePassword(req.body.password, function(err, isMatch) {
                if (isMatch && !err) {
                    var token = jwt.encode(coach, config.secret);

                    res.json({
                        success: true,
                        token: 'JWT ' + token,
                        coach: coach
                    });

                } else {
                    res.send({
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
}), controllerMatch.getMatchs)

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

//empty schema
// apiRoutes.post('/emptySchema', passport.authenticate('jwt', {
//     session: false
// }), controllerStat.emptySchema);

apiRoutes.post('/action', passport.authenticate('jwt', {
    session: false
}), controllerStat.countMainAction);

apiRoutes.post('/avgRelance', passport.authenticate('jwt', {
    session: false
}), controllerStat.avgRelance);

apiRoutes.post('/countPercent', passport.authenticate('jwt', {
    session: false
}), controllerStat.countPercent);

console.log('connected to port : ' + port);
app.use('/api', apiRoutes);
