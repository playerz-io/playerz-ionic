'use strict'


let jwt = require('jwt-simple');
let Coach = require('../models/coach').modelCoach;
let config = require('../config/database');
let stripe = require('stripe')('sk_test_xOejlDOweZYD9ypQWGPSOeaA');
let async = require('async');
// TODO:  verifier active_until date
exports.createTokenStripe = (req, res) => {
    let token_stripe = req.body.token_stripe
    let token = getToken(req.headers);

    if (token) {
        let decoded = jwt.decode(token, config.secret);

        let coach_id = decoded._id;

        async.waterfall([
            (done) => {
                Coach.findById(coach_id, (err, coach) => {
                    if (err)
                        return Utils.errorIntern(res, err);

                    coach.token_stripe = token_stripe;
                    console.log(coach);
                    coach.save((err) => {
                        if (err)
                            return Utils.errorIntern(res, err);
                    });

                    done(null, coach);
                    // res.status(202).json({
                    //   msg: 'Token saved'
                    // })
                });
            },

            (coach, done) => {

                stripe.customers.create({
                    source: coach.token_stripe,
                    plan: 'basic',
                    email: coach.email
                }, (err, customers) => {
                    // TODO: handle err
                    if (err) {
                        return Utils.errorIntern(res, err);
                    }

                    console.log(customers);

                    res.status(202).json({
                        success: true,
                        customers
                    });
                });
            }

        ]);


    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }

};
