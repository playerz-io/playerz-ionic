//coach schema extend user schema

'use strict';

var extend = require('mongoose-schema-extend');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var user = require('./user');
var Team = require('./team').schemaTeam;



var coachSchema = user.userSchema.extend({
    team: Team,
    any: Schema.Types.Mixed
})

exports.modelCoach = mongoose.model('Coach', coachSchema);
