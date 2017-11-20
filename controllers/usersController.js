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

    req.user.setPassword(req.body.newpassword.trim(), (err, user) => {
        if (err) {
            renderResponse(req, res, 'Problemas al actualizar la contraseña.');
            return;
        }

        req.user
            .save()
            .then(a => renderResponse(req, res, 'La contraseña se actualizó correctamente.'))
            .catch(err => renderResponse(req, res, 'Problemas al guardar los cambios.'));
    });
};

exports.userlistGET = (req, res, next) => {
    renderUserList(req, res, '');
};

exports.crudUser = (req, res, next) => {
    if (req.body.add) {
        renderRegister(req, res, '');
        return;
    }

    if (req.body.edit) {
        if (req.body.id) {
            Account.findOne({ _id: req.body.id })
                .then(a => renderEdit(req, res, '', a.username, a.role.includes('admin') ? true : false))
                .catch(err => renderEdit(req, res, 'Problemas al buscar el usuario.', '', false));

            return;
        }

        renderUserList(req, res, 'Debe seleccionar el usuario a editar.');
        return;
    }

    if (req.body.remove) {
        if(!req.body.id){
            renderUserList(req,res,'Debe seleccionar el usuario a eliminar.');
            return;            
        }

        Account.remove({_id: req.body.id},(err, a)=>{
            if(err){
                renderUserList(req,res,'Problemas al eliminar el usuario.');
                return;
            }

            renderUserList(req,res,'Usuario eliminado correctamente.');
        })
    }
};

exports.addUser = (req, res, next) => {
    const errors = req.validationErrors();

    if (errors) {
        renderRegister(req, res, errors.map(e => e.msg).join('</br>'));
        return;
    }

    Account.register(
        new Account({
            username: req.body.username,
            role: ['user'].concat(req.body.admin && req.body.admin === 'on' ? 'admin' : [])
        }),
        req.body.password,
        (err, account) => {
            if (err) {
                renderRegister(req, res, 'Problemas al registrar el usuario.');
                return;
            }
            renderRegister(req, res, 'Usuario agregado correctamente.');
        });
};

exports.editUser = (req, res, next) => {
    const errors = req.validationErrors();

    if (errors) {
        renderEdit(req, res, errors.map(e => e.msg).join('</br>'), '', false);
        return;
    }

    Account.findOne({ username: req.body.username }, (err, account) => {
        if (err) {
            renderEdit(req, res, 'Problemas al buscar el usuario.', req.body.username, req.body.admin ? true : false);
            return;
        }

        if (req.body.password.trim() || req.body.retrypassword.trim()) {
            if (req.body.password.trim() !== req.body.retrypassword.trim()) {
                renderEdit(req, res, 'Las contraseñas deben coincidir.', req.body.username, req.body.admin ? true : false);
                return;
            }

            account.setPassword(req.body.password.trim(), (err, a) => {
                if (err) {
                    renderEdit(req, res, 'Problemas al actualizar la contraseña.', req.body.username, req.body.admin ? true : false);
                    return;
                }

                account.role = ['user'].concat(req.body.admin ? 'admin' : []);
                account.save()
                    .then(a => renderEdit(req, res, 'Contraseña y permisos actualizados correctamente.', req.body.username, a.role.includes('admin')))
                    .catch(err => renderEdit(req, res, 'Problemas al actualizar el usuario.', req.body.username, req.body.admin ? true : false));
            });
            return;
        }

        account.role = ['user'].concat(req.body.admin ? 'admin' : []);
        account
            .save()
            .then(a => renderEdit(req, res, 'Permisos actualizados correctamente.', req.body.username, a.role.includes('admin')))
            .catch(err => renderEdit(req, res, 'Problemas al actualizar el usuario.', req.body.username, req.body.admin ? true : false));
    });
};

function renderRegister(req, res, msg) {
    res.render(
        'addedituser', {
            message: msg,
            user: req.user.username,
            group: req.user.role.includes('admin') ? 0 : 1,
            header: 'Registrar usuario',
            admin: '',
            editingUser: '',
            readonly: false,
            button: 'Registrar',
            action: 'add'
        });
}

function renderEdit(req, res, msg, username, admin) {
    res.render(
        'addedituser',
        {
            user: req.user.username,
            group: req.user.role.includes('admin') ? 0 : 1,
            message: msg,
            header: 'Editar usuario',
            admin: admin,
            editingUser: username,
            edit: true,
            readonly: true,
            button: 'Editar',
            action: 'edit'
        });
}

function renderUserList(req, res, msg) {
    Account
        .find({})
        .then(users => res.render('userlist', {
            users: users,
            user: req.user.username,
            group: req.user.role.includes('admin') ? 0 : 1,
            message: msg
        }))
        .catch(err => res.render('userlist', {
            users: [],
            user: req.user.username,
            group: req.user.role.includes('admin') ? 0 : 1,
            message: 'Problemas obteniendo la lista de usuarios.'
        }));
}

function renderResponse(req, res, msg) {
    res.render(
        'changepassword',
        {
            user: req.user.username,
            group: req.user.role.includes('admin') ? 0 : 1,
            message: msg
        });
}

