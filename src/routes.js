const { Router } = require('express');
const { check, vote, referrer } = require('./controllers.js');

const router = Router();

router.post('/check', check);
router.post('/vote', vote);
router.post('/referrer', referrer);

module.exports = router;
