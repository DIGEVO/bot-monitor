const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/',
    (req, res) => {
        if(req.protocol === 'http')
            res.redirect(`https://${req.host}/`);
        else
            res.render('login', { message: req.flash('error'), user: '' });
    });

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
