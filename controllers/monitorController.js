'use strict';

const { validationResult } = require('express-validator/check');

const mongoUtil = require('../libs/mongoutil');

exports.botListGET = (req, res, next) => mongoUtil.botList(req, res);

exports.conversationListPOST = (req, res, next) => {
    const errors = req.validationErrors();

    if (errors) {
        mongoUtil.botList(req, res, errors);
        return;
    }

    mongoUtil.conversationList(req, res);
};

