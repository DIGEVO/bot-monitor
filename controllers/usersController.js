'use strict';

const passport = require('passport');
const Account = require('../models/account');

exports.changePassword = (req, res, next) => {
    const errors = req.validationErrors();

    if (errors) {
        const msg = errors.map(e => e.msg).join('</br>');
        renderResponse(req, res, msg);
        return;
    }

    req.user.setPassword(req.body.newpassword, (err, user) => {
        if (err) {
            renderResponse(req, res, err);
            return;
        }

        req.user.save(err => {
            if (err) {
                renderResponse(req, res, 'Problemas al guardar los cambios.');
                return;
            }
            renderResponse(req, res, 'La contraseña se actualizó correctamente.');
        });
    });
};

exports.userlistGET = (req, res, next) => {
    Account.find({}, (err, users) => {
        res.render('userlist', {
            users: users,
            user: req.user.username,
            group: req.user.role.includes('admin') ? 0 : 1
        });
    });
};

function renderResponse(req, res, msg) {
    res.render(
        'changepassword',
        {
            user: req.user.username,
            group: req.user.role.includes('admin') ? 0 : 1,
            message: msg
        });
}

exports.crudUser = (req, res, next) => {
    if (req.body.add) {
        res.render(
            'adduser',
            {
                user: req.user.username,
                group: req.user.role.includes('admin') ? 0 : 1,
                message: ''
            });
        return;
    }

};

exports.addUser = (req, res, next) => {
    const errors = req.validationErrors();

    if (errors) {
        res.render('adduser', {
            user: req.user.username,
            group: req.user.role.includes('admin') ? 0 : 1,
            message: errors.map(e => e.msg).join('</br>')
        });
        return;
    }

    Account.register(
        new Account({
            username: req.body.username,
            role: ['user'].concat(req.body.admin && req.body.admin === 'on' ? 'admin' : [])
        }),
        req.body.password,
        (err, account) => {
            if (err)
                return res.render(
                    'adduser', {
                        message: err.message,
                        user: req.user.username,
                        group: req.user.role.includes('admin') ? 0 : 1
                    });
            return res.render(
                'adduser', {
                    message: 'Usuario agregado correctamente.',
                    user: req.user.username,
                    group: req.user.role.includes('admin') ? 0 : 1
                });
        });
};




