'use strict';

const express = require('express');
const router = express.Router();

const { check } = require('express-validator/check');

const monitorController = require('../controllers/monitorController.js');

router.get('/', monitorController.botListGET);
router.post('/conversations', [
    check('id', 'Se necesita que seleccione un bot').exists(),
    check('date1', 'Se necesita que seleccione una fecha de inicio').exists(),
    check('date2', 'Se necesita que seleccione una fecha de fin').exists(),
    check('date1')
        .custom((value, { req }) => {
            return new Promise((resolve, reject) => {
                if (new Date(value).getTime() > new Date(req.body.date2).getTime())
                    reject('La fecha de inicio debe ser menor o igual a fecha de fin.');
                resolve(true);
            });
        })
], monitorController.conversationListPOST);

module.exports = router;
