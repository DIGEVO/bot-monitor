'use strict';


const mongoUtil = require('../libs/mongoutil');

exports.botListGET = (req, res, next) => mongoUtil.botList(req, res);

exports.conversationListPOST = (req, res, next) => {
    req.checkBody('id', 'Se necesita que seleccione un bot').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        mongoUtil.botList(res, errors);
        return;
    }

    mongoUtil.conversationList(req, res);
};

