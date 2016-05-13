//coach schema extend user schema

'use strict';

var extend = require('mongoose-schema-extend');
var mongoose = require('mongoose');
var user = require('./user');
var Team = require('./team').schemaTeam;



var coachSchema = user.userSchema.extend({
    team: Team
})

exports.modelCoach = mongoose.model('Coach', coachSchema);
