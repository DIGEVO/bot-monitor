'use strict';

const express = require('express');
const { check } = require('express-validator/check');

const { requireRole } = require('../libs/security');
const monitorController = require('../controllers/monitorController.js');

const router = express.Router();

router.get('/', requireRole('user'), monitorController.botListGET);

router.post('/conversations', [
    requireRole('user'),
    check('id', 'Se necesita que seleccione un bot.').isLength({min: 1}),
    check('date1', 'Se necesita que seleccione una fecha de inicio.').isLength({min: 1}),
    check('date2', 'Se necesita que seleccione una fecha de fin.').isLength({min: 1}),
    check('date1')
        .custom((value, { req }) => {
            return new Promise((resolve, reject) => {
                if (new Date(value).getTime() > new Date(req.body.date2).getTime()) {
                    reject('La fecha de inicio debe ser menor o igual a fecha de fin.');
                    return;
                }
                resolve(true);
            });
        })
], monitorController.conversationListPOST);

module.exports = router;
