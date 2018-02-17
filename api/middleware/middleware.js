'use strict'

const jwt = require('jsonwebtoken')

const getToken = (headers) => {
  if (!headers) {
    return null
  }

  if (headers && headers.authorization) {
    let parted = headers.authorization.split(' ')
    if (parted.length === 2) {
      return parted[1]
    } else {
      return null
    }
  }
}

exports.handleToken = (req, res, next) => {
  let token = getToken(req.headers)

  if (token) {
    let decoded = jwt.verify(token, process.env.SECRET)

    res.locals.data = decoded
    next()
  } else {
    return res.status(403).send({
      success: false,
      msg: 'No token provided.'
    })
  }
}
