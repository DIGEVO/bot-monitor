'use strict';

const passport = require('passport');
const Account = require('../models/account');

exports.logout = (req, res, next) => {
    req.logout();
    res.redirect('/');
}


// exports.registerGET = (req, res) => res.render('register', {});

// exports.registerPOST = (req, res, next) => {
//     Account.register(new Account({ username: req.body.username }), req.body.password, (err, account) => {
//         if (err) return res.render('register', { error: err.message });

//         passport.authenticate('local')(req, res, () => {
//             req.session.save(err => {
//                 if (err) return next(err);

//                 res.redirect('/');
//             });
//         });
//     });
// };




