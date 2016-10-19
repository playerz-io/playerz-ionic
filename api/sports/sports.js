'use strict';

let Football = require('./football/football');
let Handball = require('./handball/handball');

exports.getSports = (req, res) => {

  let sports = [Football.FOOTBALL, Handball.HANDBALL];

  res.status(200).json({
    sports
  });
}
