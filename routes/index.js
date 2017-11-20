const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/',
    (req, res) => res.render('login', { message: req.flash('error'), user: '' }));

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/monitor',
    failureRedirect: '/',
    failureFlash: true,
    failureFlash: 'Usuario o contraseña incorrecta'
}));

module.exports = router;
