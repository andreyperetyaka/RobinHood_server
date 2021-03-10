const { Router } = require('express');
const { login, getVotes, postVote, referrer } = require('./controllers.js');

const router = Router();

router.get('/login', login);
router.put('/referrer', referrer);
router.get('/votes', getVotes);
router.post('/votes', postVote);

module.exports = router;
