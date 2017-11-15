'use strict';

const express = require('express');
const router = express.Router();

const monitorController = require('../controllers/monitorController.js');

router.get('/', monitorController.botListGET);
router.post('/responses', monitorController.conversationListPOST);

module.exports = router;