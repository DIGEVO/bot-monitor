const express = require('express');
const { check } = require('express-validator/check');

const { requireRole } = require('../libs/security');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get(
    '/changepassword',
    requireRole('user'),
    (req, res) => res.render(
        'changepassword', {
            user: req.user.username,
            group: req.user.role.includes('admin') ? 0 : 1,
            message: ''
        }));

router.post(
    '/changepassword', [
        requireRole('user'),
        check('oldpassword', 'Se necesita la contraseña actual.').isLength({ min: 1 }),
        check('oldpassword')
            .custom((value, { req }) => {
                return new Promise((resolve, reject) => {
                    req.user.authenticate(value, (err, isMatch) => {
                        if (err) {
                            reject('Error al verificar la contraseña actual.');
                            return;
                        }
                        if (isMatch) {
                            resolve(true);
                            return;
                        }
                        reject('Problemas al validar la contraseña actual.');
                    });
                });
            }),
        check('newpassword', 'Se necesita la nueva contraseña.').isLength({ min: 1 }),
        check('retrypassword', 'Es necesario repetir la nueva contraseña.').isLength({ min: 1 }),
        check('newpassword')
            .custom((value, { req }) => {
                return new Promise((resolve, reject) => {
                    if (value !== req.body.retrypassword) {
                        reject('Vuelva a intentarlo, las contraseñas no coinciden.');
                        return;
                    }
                    resolve(true);
                });
            })],
    usersController.changePassword);

router.get('/', requireRole('admin'), usersController.userlistGET);

router.post('/cruduser', requireRole('admin'), usersController.crudUser);

router.post(
    '/add', [
        requireRole('admin'),
        check('username', 'Debe especificar el usuario.').isLength({ min: 1 }),
        check('password', 'Debe especificar una contraseña.').isLength({ min: 1 }),
        check('retrypassword', 'Debe especificar repetir la contraseña.').isLength({ min: 1 }),
        check('password').custom((value, { req }) => {
            return new Promise((resolve, reject) => {
                if (value !== req.body.retrypassword) {
                    reject('Las contraseñas deben coincidir.');
                    return;
                }
                resolve(true);
            });
        })
    ],
    usersController.addUser);

router.post(
    '/edit', [
        requireRole('admin'),
        check('username', 'Debe especificar el usuario.').isLength({ min: 1 })
    ],
    usersController.editUser);

module.exports = router;
