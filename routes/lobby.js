const { Router } = require('express');
const checkIpBan = require('./checkIpBan');
const modsArray = require('../modsadmins/mods');
const asyncMiddleware = require('./asyncMiddleware');

const router = new Router();

router.get('/', checkIpBan, asyncMiddleware(async (req, res) => {
    res.render('lobby', {
        headerActive: 'lobby',
        optionsCog: true,
        isMod: modsArray.includes(req.user.username.toLowerCase()),
    });
}));

module.exports = router;
