const { Router } = require('express');
const { checkIpBan } = require('./middleware');

const router = new Router();

router.get('/', checkIpBan, (req, res) => {
    res.render('lobby', {
        headerActive: 'lobby',
        optionsCog: true,
    });
});

module.exports = router;
