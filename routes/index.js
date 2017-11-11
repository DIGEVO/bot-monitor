var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) =>
//res.redirect(`https://${req.get('host')}/intents`));
res.redirect('/monitor'));

module.exports = router;
