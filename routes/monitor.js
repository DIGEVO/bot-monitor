'use strict';

const express = require('express');
const router = express.Router();

const monitorController = require('../controllers/monitorController.js');

router.get('/', monitorController.botListGET);
router.post('/users', monitorController.userListPOST);

module.exports = router;