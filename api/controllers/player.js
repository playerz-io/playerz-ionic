//controller player

var getToken = require('./token');
var jwt = require('jwt-simple');
var config = require('../config/database');
var Player = require('../models/player').modelPlayer;

exports.addPosition = function(req, res){
    var token = getToken(req.headers);

    if (token) {
	var decoded = jwt.decode(token, config.secret);


	Player.findById(req.body.player_id, function(err, player){
	    if (err)
		res.status(404).json({ error: err});

	    console.log(player)
	    player.position = req.body.position;
	    player.save();

	    res.status(201).json({ success: true, player: player});
	})

    } else {
	     return res.status(403).send({success: false, msg: 'No token provided.'});
    }
};
