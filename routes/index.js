const express = require('express');
const passport = require('passport');

const auth = require('../controllers/authenticationController');

const router = express.Router();

router.get('/', (req, res) => res.render('login', { message: req.flash('error'), user: '' }));

router.get('/logout', auth.logout);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/monitor',
    failureRedirect: '/',
    failureFlash: true,
    failureFlash: 'Usuario o contraseña incorrecta'
}));

module.exports = router;
