//coach schema extend user schema
'use strict';

let extend = require('mongoose-schema-extend');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let user = require('./user');
let Team = require('./team').schemaTeam;



let coachSchema = user.userSchema.extend({
    team: Team,
    any: Schema.Types.Mixed
})

exports.modelCoach = mongoose.model('Coach', coachSchema);
